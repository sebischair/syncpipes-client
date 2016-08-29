export class Diagram {

  constructor(id, schemaUrl, container, width = 300, height = 300) {

    this.container = container;

    this.id = id;
    this.element = this.container.find('.target')[0];
    this.legendElement = this.container.find('.legend-items')[0];
    this.schemaUrl = schemaUrl;
    this.viewerWidth = width;
    this.viewerHeight = height;
    this.maxDepth = 20;
    this.maxLabelLength = 0;
    this.baseSvg = null;
    this.svgGroup = null;
    this.counter = 0;
    this.labels = {
      allOf: true,
      anyOf: true,
      oneOf: true,
      'object{ }': true
    };
    this.duration = 750;

    this.createDiagram();
  }

  /**
   * Zoom the tree
   */
  zoom() {
    this.svgGroup.attr('transform', 'translate(' + this.zoomListener.translate() + ')' + 'scale(' + this.zoomListener.scale() + ')');
  }

  /**
   * Perform the d3 zoom based on position and scale
   */
  interpolateZoom(translate, scale) {
    return d3.transition().duration(350).tween('zoom', () => {
      var iTranslate = d3.interpolate(this.zoomListener.translate(), translate),
          iScale     = d3.interpolate(this.zoomListener.scale(), scale);
      return (t) => {
        this.zoomListener
            .scale(iScale(t))
            .translate(iTranslate(t));
        this.zoom();
      };
    });
  }

  /**
   * Click handler for the zoom control
   */
  zoomClick(event, direction = 1) {
    //clicked     = event.currentTarget,
    var factor      = 0.2,
        target_zoom = 1,
        center      = [ this.viewerWidth / 2, this.viewerHeight / 2 ],
        zl          = this.zoomListener,
        extent      = zl.scaleExtent(),
        translate   = zl.translate(),
        translate0  = [],
        l           = [],
        view        = {x: translate[ 0 ], y: translate[ 1 ], k: zl.scale()};

    event.preventDefault();
    target_zoom = zl.scale() * (1 + factor * direction);

    if (target_zoom < extent[ 0 ] || target_zoom > extent[ 1 ]) {
      return false;
    }

    translate0 = [ (center[ 0 ] - view.x) / view.k, (center[ 1 ] - view.y) / view.k ];
    view.k = target_zoom;
    l = [ translate0[ 0 ] * view.k + view.x, translate0[ 1 ] * view.k + view.y ];

    view.x += center[ 0 ] - l[ 0 ];
    view.y += center[ 1 ] - l[ 1 ];

    this.interpolateZoom([ view.x, view.y ], view.k);
  }

  /**
   * Helper functions for collapsing nodes.
   */
  collapse(d) {
    if (d.children) {
      d._children = d.children;
      //d._children.forEach(collapse);
      d.children = null;
    }
  }

  /**
   * Helper functions for expanding nodes.
   */
  expand(d) {
    if (d._children) {
      d.children = d._children;
      //d.children.forEach(expand);
      d._children = null;
    }

    if (d.children) {
      var count = d.children.length, i;
      for (i = 0; i < count; i++) {
        if (this.labels[ d.children[ i ].name ]) {
          this.expand(d.children[ i ]);
        }
      }
    }
  }


  /**
   * Reset the tree starting from the passed source.
   */
  resetTree(source, level) {
    this.visit(source, (d) => {
      if (d.children && d.children.length > 0 && d.depth > level && !this.labels[ d.name ]) {
        this.collapse(d);
        //d._children = d.children;
        //d.children = null;
      } else if (this.labels[ d.name ]) {
        this.expand(d);
      }
    }, (d) => {
      if (d.children && d.children.length > 0) {
        return d.children;
      } else if (d._children && d._children.length > 0) {
        return d._children;
      } else {
        return null;
      }
    });
  }

  /**
   * Toggle children function
   */
  toggleChildren(d) {
    if (d.children) {
      this.collapse(d);
    } else if (d._children) {
      this.expand(d);
    }
    return d;
  }

  /**
   * Toggle children on node click.
   */
  click(d) {
    if (!this.labels[ d.name ]) {
      if (d3.event && d3.event.defaultPrevented) {
        return;
      } // click suppressed
      d = this.toggleChildren(d);
      this.update(d);
      this.centerNode(d);
    }
  }

  /**
   * Show info on node title click.
   */
  clickTitle(d) {
    if (!this.labels[ d.name ]) {
      if (d3.event && d3.event.defaultPrevented) {
        return;
      } // click suppressed
      //var panel = $('#info-panel');

      if (this.focusNode) {
        d3.select(`#n-${this.id}-${this.focusNode.id}`).classed('focus', false);
      }
      this.focusNode = d;
      this.centerNode(d);
      d3.select(`#n-${this.id}-${d.id}`).classed('focus', true);
      // emit permalink
      if (this.nodeSelectCallback instanceof Function) {
        this.nodeSelectCallback(d, this.compilePath(d));
      }
    }
  }

  onNodeSelect(callback) {
    this.nodeSelectCallback = callback;
  }

  /**
   * Create an index-based path for the node from the root.
   */
  getNodePath(node, path) {
    var p      = path || [],
        parent = node.parent;

    if (parent) {
      var children = parent.children || parent._children;

      p.unshift(children.indexOf(node));
      return this.getNodePath(parent, p);
    } else {
      return p;
    }
  }

  /**
   * Create a "breadcrumb" for the node.
   */
  compilePath(node, path = '') {
    if (node.isReal === true) {
      if (path.length > 0) {
        path = node.name + '/' + path;
      } else {
        path = node.name;
      }
    }
    if (node.parent) {
      return this.compilePath(node.parent, path)
    }
    // sanitize
    path = path.replace('[ ]', '').replace('{ }', '');

    return path;
  }

  /**
   * Update the tree, removing or adding nodes from/to the passed source node
   */
  update(source) {
    var duration = this.duration;
    var root = this.treeData;
    // Compute the new height, function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    var levelWidth = [ 1 ];
    var childCount = function (level, n) {

      if (n.children && n.children.length > 0) {
        if (levelWidth.length <= level + 1) {
          levelWidth.push(0);
        }

        levelWidth[ level + 1 ] += n.children.length;
        n.children.forEach(function (d) {
          childCount(level + 1, d);
        });
      }
    };
    childCount(0, root);
    var newHeight = d3.max(levelWidth) * 45; // 25 pixels per line
    this.tree.size([ newHeight, this.viewerWidth ]);

    // Compute the new tree layout.
    var nodes = this.tree.nodes(root).reverse(),
        links = this.tree.links(nodes);

    // Set widths between levels based on maxLabelLength.
    nodes.forEach((d) => {
      d.y = (d.depth * (this.maxLabelLength * 8)); //maxLabelLength * 8px
      // alternatively to keep a fixed scale one can set a fixed depth per level
      // Normalize for fixed-depth by commenting out below line
      // d.y = (d.depth * 500); //500px per level.
    });
    // Update the nodes…
    var node = this.svgGroup.selectAll('g.node').data(nodes, (d) => {
      return d.id || (d.id = ++this.counter);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
                        .attr('class', (d) => {
                          return this.labels[ d.name ] ? 'node label' : 'node';
                        })
                        .classed('deprecated', function (d) {
                          return d.deprecated;
                        })
                        .attr('id', (d) => {
                          return `n-${this.id}-${d.id}`;
                        })
                        .attr('transform', function () {
                          return 'translate(' + source.y0 + ',' + source.x0 + ')';
                        });

    nodeEnter.append('circle')
             //.attr('class', 'nodeCircle')
             .attr('r', 0)
             .classed('collapsed', function (d) {
               return d._children ? true : false;
             })
             .on('click', (d) => {
               this.click(d);
             });

    nodeEnter.append('text')
             .attr('x', function () {
               return 10;
               //                return d.children || d._children ? -10 : 10;
             })
             .attr('dy', '.35em')
             .attr('class', function (d) {
               return (d.children || d._children) ? 'node-text node-branch' : 'node-text';
             })
             .classed('abstract', function (d) {
               return d.opacity < 1;
             })
             .attr('text-anchor', function () {
               //return d.children || d._children ? 'end' : 'start';
               return 'start';
             })
             .text(function (d) {
               return d.name + (d.require ? '*' : '');
             })
             .style('fill-opacity', 0)
             .on('click', (d) => {
               this.clickTitle(d);
             })
             .on('dblclick', (d) => {
               this.click(d);
               this.clickTitle(d);
               d3.event.stopPropagation();
             });


    // Change the circle fill depending on whether it has children and is collapsed
    node.select('.node circle')
        .attr('r', 6.5)
        .classed('collapsed', function (d) {
          return (d._children ? true : false);
        });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
                         .duration(duration)
                         .attr('transform', function (d) {
                           return 'translate(' + d.y + ',' + d.x + ')';
                         });

    // Fade the text in
    nodeUpdate.select('text')
              .style('fill-opacity', function (d) {
                return d.opacity || 1;
              });

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
                       .duration(duration)
                       .attr('transform', function () {
                         return 'translate(' + source.y + ',' + source.x + ')';
                       })
                       .remove();

    nodeExit.select('circle').attr('r', 0);

    nodeExit.select('text').style('fill-opacity', 0);

    // Update the links…
    var link = this.svgGroup.selectAll('path.link')
                   .data(links, function (d) {
                     return d.target.id;
                   });

    // Enter any new links at the parent's previous position.
    link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', () => {
          var o = {
            x: source.x0,
            y: source.y0
          };
          return this.diagonal1({
            source: o,
            target: o
          });
        });

    // Transition links to their new position.
    link.transition().duration(duration).attr('d', (d) => {
      return this.diagonal1(d);
    });

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr('d', () => {
          var o = {
            x: source.x,
            y: source.y
          };
          return this.diagonal1({
            source: o,
            target: o
          });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  /**
   * Reset and center the tree.
   */
  resetViewer() {
    //Firefox will choke if the viewer-page is not visible
    //TODO: fix on refactor to use pagecontainer event
    var page = angular.element('#viewer-page');

    page.css('display', 'block');

    // Define the root
    let root = this.treeData;
    root.x0 = this.viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    // Call visit function to set initial depth
    this.tree.nodes(root);
    this.resetTree(root, 1);
    this.update(root);

    //reset the style for viewer-page
    page.css('display', '');

    this.centerNode(root, 4);
  }

  /**
   * A recursive helper function for performing some setup by walking
   * through all nodes
   */
  visit(parent, visitFn, childrenFn) {
    if (!parent) {
      return;
    }
    visitFn(parent);

    var children = childrenFn(parent);

    if (children) {
      var count = children.length, i;
      for (i = 0; i < count; i++) {
        this.visit(children[ i ], visitFn, childrenFn);
      }
    }
  }

  /**
   * Create the tree data object from the schema(s)
   */
  compileData(schema, parent, name, real, depth) {
    // Ensure healthy amount of recursion
    depth = depth || 0;
    if (depth > this.maxDepth) {
      return;
    }
    var key, node,
        s            = schema.$ref ? tv4.getSchema(schema.$ref) : schema,
        props        = s.properties,
        items        = s.items,
        owns         = Object.prototype.hasOwnProperty,
        all          = {},
        parentSchema = function (node) {
          var schema = node.id || node.$ref || node.schema;

          if (schema) {
            return schema;
          } else if (node.parentSchema) {
            return parentSchema(node.parentSchema);
          } else {
            return null;
          }
        };

    if (s.allOf) {
      all.allOf = s.allOf;
    }

    if (s.oneOf) {
      all.oneOf = s.oneOf;
    }

    if (s.anyOf) {
      all.anyOf = s.anyOf;
    }

    node = {
      description: schema.description || s.description,
      name: (schema.$ref && real ? name : false) || s.title || name || 'schema',
      isReal: real,
      plainName: name,
      type: s.type,
      displayType: s.type || (s[ 'enum' ] ? 'enum: ' + s[ 'enum' ].join(', ') : s.items ? 'array' : s.properties ? 'object' : 'ambiguous'),
      translation: schema.translation || s.translation,
      example: schema.example || s.example,
      opacity: real ? 1 : 0.5,
      required: s.required,
      schema: s.id || schema.$ref || parentSchema(parent),
      parentSchema: parent,
      deprecated: schema.deprecated || s.deprecated
    };

    node.require = parent && parent.required ? parent.required.indexOf(node.name) > -1 : false;

    if (parent) {
      if (node.name === 'item') {
        node.parent = parent;
        if (node.type) {
          node.name = node.type;
          parent.children.push(node);
        }
      } else if (parent.name === 'item') {
        parent.parent.children.push(node);
      } else {
        parent.children.push(node);
      }
    } else {
      this.treeData = node;
    }

    if (node.type === 'array') {
      node.name += '[' + (s.minItems || ' ') + ']';
      node.minItems = s.minItems;
    }

    if (node.type === 'object' && node.name !== 'item') {
      node.name += '{ }';
    }

    if (props || items || all) {
      node.children = [];
    }

    for (key in props) {
      if (!owns.call(props, key)) {
        continue;
      }
      this.compileData(props[ key ], node, key, true, depth + 1);
    }

    for (key in all) {
      if (!owns.call(all, key)) {
        continue;
      }
      if (!all[ key ]) {
        continue;
      }
      var allNode = {
        name: key,
        children: [],
        opacity: 0.5,
        parentSchema: parent,
        schema: schema.$ref || parentSchema(parent)
      };

      if (node.name === 'item') {
        node.parent.children.push(allNode);
      } else {
        node.children.push(allNode);
      }

      for (var i = 0; i < all[ key ].length; i++) {
        this.compileData(all[ key ][ i ], allNode, s.title || all[ key ][ i ].type, false, depth + 1);
      }
    }

    if (angular.isObject(items)) {
      this.compileData(items, node, 'item', false, depth + 1);
    } else if (angular.isArrayitems) {

      items.forEach((itm, idx) => {
        this.compileData(itm, node, idx.toString(), false, depth + 1);
      });
    }
  }

  /**
   * The d3 diagonal projection for use by the node paths.
   */
  diagonal1(d) {
    var src   = d.source,
        node  = d3.select(`#n-${this.id}-${src.id}`)[ 0 ][ 0 ],
        dia,
        width = 0;

    if (node) {
      width = node.getBBox().width;
    }

    dia = 'M' + (src.y + width) + ',' + src.x +
      'H' + (d.target.y - 30) + 'V' + d.target.x +
      //+ (d.target.children ? '' : 'h' + 30);
      ('h' + 30);

    return dia;
  }

  /**
   * Function to center node when clicked so node doesn't get lost when collapsing with large amount of children.
   */
  centerNode(source, ratioX) {
    var rX    = ratioX ? ratioX : 2,
        zl    = this.zoomListener,
        scale = zl.scale(),
        x     = -source.y0 * scale + this.viewerWidth / rX,
        y     = -source.x0 * scale + this.viewerHeight / 2;

    d3.select(`g#node-group-${this.id}`).transition()
      .duration(this.duration)
      .attr('transform', 'translate(' + x + ',' + y + ')scale(' + scale + ')');
    zl.scale(scale);
    zl.translate([ x, y ]);
  }

  /**
   * Create the d3 diagram.
   *
   * @param {function} callback Function to run after the diagram is created
   */
  createDiagram() {
    tv4.asyncLoad([ this.schemaUrl ], () => {

      this.element.innerHTML = '';
      this.legendElement.innerHTML = '';

      this.compileData(tv4.getSchema(this.schemaUrl), false, 'schema');

      // Calculate total nodes, max label length
      var totalNodes = 0;
      // panning variables
      //var panSpeed = 200;
      //var panBoundary = 20; // Within 20px from edges will pan when dragging.

      // size of the diagram
      var viewerWidth = this.viewerWidth;
      var viewerHeight = this.viewerHeight;

      this.zoomListener = d3.behavior.zoom().scaleExtent([ 0.1, 3 ]).on('zoom', () => this.zoom());

      this.baseSvg = d3.select(this.element).append('svg')
      //.attr('id', 'jsv-tree')
                       .attr('class', 'overlay json-schema-svg')
                       .attr('width', viewerWidth)
                       .attr('height', viewerHeight)
                       .call(this.zoomListener);

      this.tree = d3.layout.tree().size([ viewerHeight, viewerWidth ]);

      // Call JSV.visit function to establish maxLabelLength
      this.visit(this.treeData, (d) => {
        totalNodes++;
        this.maxLabelLength = Math.max(d.name.length, this.maxLabelLength);
      }, (d) => {
        return d.children && d.children.length > 0 ? d.children : null;
      });

      // Sort the tree initially in case the JSON isn't in a sorted order.
      //JSV.sortTree();

      this.svgGroup = this.baseSvg.append('g').attr('id', `node-group-${this.id}`);

      // Layout the tree initially and center on the root node.
      this.resetViewer();

      this.centerNode(this.treeData, 4);

      // define the legend svg, attaching a class for styling
      var legendData = [ {
        text: 'Expanded',
        y: 20
      }, {
        text: 'Collapsed',
        iconCls: 'collapsed',
        y: 40
      }, {
        text: 'Selected',
        itemCls: 'focus',
        y: 60
      }, {
        text: 'Required*',
        y: 80
      }, {
        text: 'Object{ }',
        iconCls: 'collapsed',
        y: 100
      }, {
        text: 'Array[minimum #]',
        iconCls: 'collapsed',
        y: 120
      }, {
        text: 'Abstract Property',
        itemCls: 'abstract',
        y: 140,
        opacity: 0.5
      }, {
        text: 'Deprecated',
        itemCls: 'deprecated',
        y: 160
      } ];


      var legendSvg = d3.select(this.legendElement).append('svg')
                        .attr('width', 170)
                        .attr('height', 180);

      // Update the nodes…
      var legendItem = legendSvg.selectAll('g.item-group')
                                .data(legendData)
                                .enter()
                                .append('g')
                                .attr('class', function (d) {
                                  var cls = 'item-group ';

                                  cls += d.itemCls || '';
                                  return cls;
                                })
                                .attr('transform', function (d) {
                                  return 'translate(10, ' + d.y + ')';
                                });

      legendItem.append('circle')
                .attr('r', 6.5)
                .attr('class', function (d) {
                  return d.iconCls;
                });

      legendItem.append('text')
                .attr('x', 15)
                .attr('dy', '.35em')
                .attr('class', 'item-text')
                .attr('text-anchor', 'start')
                .style('fill-opacity', function (d) {
                  return d.opacity || 1;
                })
                .text(function (d) {
                  return d.text;
                });

      this.container.find('.zoom-controls > a').on('click', (event) => {
        this.zoomClick(event);
      });

      this.container.find('.tree-controls > a.reset-tree').on('click', () => {
        this.resetViewer();
      });

      this.resetViewer();

      this.viewerInit = true;
    });
  }
}
