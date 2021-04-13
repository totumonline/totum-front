(function () {

        $(function () {
            let scrollWidth = localStorage.getItem('topNavScroll');
            let $nav = $('.totbar-default.navbar-default');
            if (scrollWidth > 0)
                $nav.scrollLeft(scrollWidth);
            $nav.on('scroll', () => {
                localStorage.setItem('topNavScroll', $nav.scrollLeft());
            })

        })


        const goToTheTable = function (json) {
            if (json) {
                let row = json.chdata.rows[Object.keys(json.chdata.rows)[0]];
                const _goToTheTable = function (tree_branch, table_id) {
                    App.getPcTableById("tree").then(function (pcTable) {
                        pcTable.model.checkEditRow({id: tree_branch}).then(function (tree) {
                            window.location.href = '/Table/' + tree.row.top.v + '/' + table_id;
                        });
                    });
                }
                if (row['type'].v === 'calcs') {
                    App.getPcTableById(1).then(function (pcTable) {
                        pcTable.model.checkEditRow({id: row.tree_node_id.v}).then(function (table) {
                            _goToTheTable(table.row.tree_node_id.v, row.tree_node_id.v)
                        });
                    });
                } else {
                    _goToTheTable(row.tree_node_id.v, row.id)
                }
            }
        }


        addTree = function (prefix, data, isCreatorView) {
            let $pageContent = $('div.page_content');
            if (!App.isTopWindow()) {
                $pageContent.addClass('tree-minifyed iframed');
                return false;
            }
            window.TREE_DATA = data;

            let isMobile = screen.width <= window.MOBILE_MAX_WIDTH;
            const miniSize = 660;
            if (isMobile) {
                isCreatorView = false
            } else {
                $(window).on('resize', function () {
                    if (window.innerWidth <= miniSize && !$pageContent.is('.tree-minifyed')) {
                        changeTreeSize(true);
                    }
                })
                if (localStorage.getItem('notCreator'))
                    isCreatorView = false
            }

            $.jstree.defaults.core.dblclick_toggle = false;
            $.jstree.defaults.core.expand_selected_onload = true;
            $.jstree.defaults.core.force_text = true;

            let treeStorage = localStorage.getItem('tree') || '{}';
            treeStorage = JSON.parse(treeStorage);

            $.each(data, function (k, v) {
                data[k]['data'] = {'type': v.type}

                if (v.id.match(/^table/) && v.icon) {
                    data[k].icon = "fa fa-" + v.icon;
                }

                if (v.state && v.state.selected) {
                    data[k]["li_attr"] = {"class": "jstree-selected"}
                }
                if (treeStorage[v.id]) {
                    if (!data[k].state) data[k].state = {};
                    data[k].state.opened = true;
                }
                if (v.href) {
                    data[k]["a_attr"] = {"href": (v.href.toString().match(/\/Table\//) ? '' : prefix) + v.href}
                } else if (v.link) {
                    data[k]["a_attr"] = {"href": v.link}
                }
                if (isCreatorView) {
                    if (['link', 'anchor', 'folder'].indexOf(v.type) !== -1) {
                        v.a_attr = v.a_attr || {};
                        v.a_attr = {...v.a_attr, ...{"class": 'edit-folder', "data-id": v.id.substr(4)}}
                    }


                    switch (v.type) {
                        case 'folder':
                            data.push({
                                type: 'plus'
                                , id: 'plus-table' + v.id.substring(4)
                                , text: 'Таблицу'
                                , parent: v.id
                                , li_attr: {class: "jstree-creatorView"}
                            });
                            data.push({
                                type: 'plus'
                                , id: 'plus-folder' + v.id.substring(4)
                                , text: 'Папку/Ссылку'
                                , parent: v.id
                                , li_attr: {class: "jstree-creatorView"}
                            });

                            break;
                        case 'cycle_name':
                            data.push({
                                type: 'plus'
                                , id: 'plus-calcs' + v.parent.substring(4)
                                , text: 'Таблицу'
                                , parent: v.id
                                , li_attr: {class: "jstree-creatorView"}
                            });
                            break;
                        case 'table_cycles':
                            v.a_attr = {...v.a_attr, ...{"class": 'add_calcs_table', "data-id": v.id.substr(5)}}
                            break;

                    }
                }
            });

            let match;
            if (isCreatorView && (match = prefix.match(/^.*?(\d+)/))) {
                data.push({
                    type: 'plus'
                    , id: 'plus-table' + match[1]
                    , text: 'Таблицу'
                    , parent: '#'
                    , li_attr: {class: "jstree-creatorView"}
                });
                data.push({
                    type: 'plus'
                    , id: 'plus-folder' + match[1]
                    , text: 'Папку/Ссылку'
                    , parent: '#'
                    , li_attr: {class: "jstree-creatorView"}
                });
            }


            let $leftTree = $('#leftTree');
            if (isCreatorView) {
                $leftTree.on("init.jstree", function (e, data) {
                    let c = $.jstree.core.prototype.redraw_node
                    $leftTree.jstree(true).redraw_node = function (node, deep, is_callback, force_render) {
                        let _node = c.bind(this)(node, deep, is_callback, force_render);
                        if (node.match(/^tree/)) {
                            let tmp = $leftTree.jstree(true).get_node(node)
                            if (tmp.data.type == 'folder') {
                                $(_node).addClass('tree-folder')
                            }
                        }

                        let edit_folder = $(_node).find('>a.edit-folder');
                        if (edit_folder.length) {

                            let i = $('<i class="fa fa-edit edit-folder-icon"></i>');
                            i.on('click', () => {
                                (new EditPanel("tree", BootstrapDialog.TYPE_DANGER, {id: edit_folder.data('id')})).then(goToTheTable)
                                return false
                            })
                            edit_folder.find('>i').after(i)
                        } else {
                            let add_calcs = $(_node).find('>a.add_calcs_table');
                            if (add_calcs.length) {
                                let i = $('<i class="fa fa-plus edit-folder-icon"></i>');
                                i.on('click', () => {
                                    (new EditPanel(1, BootstrapDialog.TYPE_DANGER, {
                                        type: {v: 'calcs'},
                                        tree_node_id: {v: add_calcs.data('id')}
                                    }, {}, {type: true, tree_node_id: true})).then(goToTheTable)
                                    return false
                                })
                                add_calcs.find('>i').after(i)
                            }
                        }
                        return _node;
                    };
                })
            } else {
                $leftTree.on("init.jstree", function (e, data) {
                    let c = $.jstree.core.prototype.redraw_node
                    $leftTree.jstree(true).redraw_node = function (node, deep, is_callback, force_render) {
                        let _node = c.bind(this)(node, deep, is_callback, force_render);
                        if (node.match(/^tree/)) {
                            let tmp = $leftTree.jstree(true).get_node(node)
                            if (tmp.data.type == 'folder') {
                                $(_node).addClass('tree-folder')
                            }
                        }
                        return _node;
                    }
                })
            }

            let $scrollTreeBlock = $('#LeftTree');
            let treeScrollPath = () => {
                return 'tree_scroll_part_' + (window.top_branch || (window.location.pathname.match(/\/Table\/(\d+)/) || {1: 0})[1]);
            }


            const createJstree = function () {
                $leftTree.jstree({
                    "state": {"key": "leftTree"},
                    'core': {
                        'check_callback': true,
                        'expand_selected_onload': true,
                        "open_parents": true,
                        'data': data,
                        themes: {
                            'name': 'default'
                        }
                    },
                    "types": {
                        "folder": {},
                        "plus": {"icon": "fa fa-plus"},
                        "cycle_name": {"icon": "fa fa-dot-circle-o"},
                        "text": {"icon": "jstree-file"},
                        "table": {"icon": "jstree-file"},
                        "table_simple": App.tableTypes.simple,
                        "table_version": App.tableTypes.version,
                        "table_calcs": App.tableTypes.calcs,
                        "table_tmp": App.tableTypes.tmp,
                        "table_globcalcs": App.tableTypes.globcalcs,
                        "table_cycles": App.tableTypes.cycles,
                        "table_data": {"icon": "jstree-file"},
                    },
                    "plugins": ["types", "themes"]
                });
                niceScrollResize();
            };
            $leftTree.on('loaded.jstree after_open.jstree', function (event) {
                let treeWidth = $leftTree.width();
                $leftTree.find('a.jstree-anchor').each(function () {
                    let a = $(this);
                    let offsetleft = a.offset().left;
                    a.width(treeWidth - offsetleft);
                });
                if (event.type === 'loaded') {
                    let scrollSaved = localStorage.getItem(treeScrollPath());
                    if (scrollSaved) {
                        $scrollTreeBlock.scrollTop(scrollSaved);
                    }
                    niceScrollResize();
                }

            });


            $leftTree.on('select_node.jstree', function (event, d) {

                localStorage.setItem(treeScrollPath(), $scrollTreeBlock.scrollTop());

                switch ((d.node.data ? d.node.data.type : null) || d.node.type) {
                    case 'plus':
                        let subj = d.node.id.substring(5, 10);

                        if (subj === 'calcs') {
                            let parentId = d.node.id.substring(11);
                            let cycleId = d.node.parent.substring(5);
                            (new EditPanel(1, BootstrapDialog.TYPE_DANGER, {
                                tree_node_id: {v: parentId},
                                type: {v: "calcs"}
                            })).then(function (json) {
                                if (json) window.location.reload(true);
                            })
                        } else if (subj === 'table') {
                            let parentId = d.node.id.length > 10 ? d.node.id.substring(10) : window.location.pathname.match(/^\/.*\/(\d+)\//)[1];
                            (new EditPanel(1, BootstrapDialog.TYPE_DANGER, {tree_node_id: {v: parentId}})).then(goToTheTable)
                        } else {
                            let parentId = d.node.id.length > 11 ? d.node.id.substring(11) : window.location.pathname.match(/^\/.*\/(\d+)\//)[1];
                            (new EditPanel("tree", BootstrapDialog.TYPE_DANGER, {parent_id: {v: parentId}})).then(function (json) {
                                if (json) window.location.reload(true);
                            })
                        }
                        return false;
                        break;
                    case 'link':
                        window.location.href = d.node.a_attr.href;
                        break;
                    case 'folder':
                    case 'project':
                        if (d.node.state.opened) {
                            $('#leftTree').jstree('close_node', d.node);
                            if (treeStorage[d.node.id]) {
                                delete treeStorage[d.node.id]
                                localStorage.setItem('tree', JSON.stringify(treeStorage))
                            }
                        } else {
                            $('#leftTree').jstree('open_node', d.node);
                            treeStorage[d.node.id] = true;
                            localStorage.setItem('tree', JSON.stringify(treeStorage))
                        }
                        return false;
                        break;
                    default:

                        if (!window.location.pathname.match(/^\/Table\//))
                            window.location.href = d.node.original.href;
                        else
                            window.location.href = d.node.original.link ? d.node.original.link : (d.node.original.href[0] !== '/' ? prefix + d.node.original.href : d.node.original.href);
                }
                return false;
            });


            const niceScrollResize = function () {
                setTimeout(function () {
                    $scrollTreeBlock.getNiceScroll().resize();

                }, 250)
            };

            $leftTree.on('open_node.jstree', function (event, d) {
                treeStorage[d.node.id] = true;
                localStorage.setItem('tree', JSON.stringify(treeStorage));
                niceScrollResize();
            });
            $leftTree.on('close_node.jstree', function (event, d) {
                if (treeStorage[d.node.id]) {
                    delete treeStorage[d.node.id];
                    localStorage.setItem('tree', JSON.stringify(treeStorage))
                }
                niceScrollResize();
            });


            let TreeMinimizerStorage = localStorage.getItem('TreeMinimizer') || "false";
            TreeMinimizerStorage = JSON.parse(TreeMinimizerStorage);

            let changeTreeSize = function ($setMini) {
                TreeMinimizerStorage = $setMini;
                const $mainPage = $('#page-tree');
                let isTreeOnPageSide = $('#page-tree').length && !($('#main-page').length || $('#tables_tabls').length);

                if ($setMini) {
                    $('body>.page_content').addClass('tree-minifyed');
                    $('#LeftTree').getNiceScroll().resize();
                    if (isTreeOnPageSide) {
                        $mainPage.append($leftTree);
                        $leftTree.trigger('after_open')
                    }
                } else {
                    $('body>.page_content').removeClass('tree-minifyed');
                    if (isTreeOnPageSide) {
                        $('.TreeContainer').append($leftTree);
                        $leftTree.trigger('after_open');
                    }
                }
                if ($('#table').data('pctable')) {
                    $('#table').data('pctable').setWidthes();
                }
                createJstree();
                localStorage.setItem('TreeMinimizer', JSON.stringify(TreeMinimizerStorage));
                niceScrollResize();
            };

            if (!isMobile) {
                $scrollTreeBlock.niceScroll({
                    cursorwidth: 7,
                    mousescrollstep: 190,
                    mousescroll: 190,
                    autohidemode: false,
                    enablekeyboard: false,
                    cursoropacitymin: 1,
                    railoffset: {left: 4},
                    cursorcolor: '#e1e0df'
                });
            }


            $('#TreeMaximizer').on('click', function () {


                if (isMobile || window.innerWidth <= miniSize) {
                    let tree = $('<div>');
                    tree.append($('#branch-title'))
                    tree.append($('#leftTree'))
                    App.mobilePanel('<a class="totum-brand" href="/"><span>' + $('.totum-brand span:first').text() + '</span></a>', tree, {
                        onhide: function () {
                            const $mainPage = $('#page-tree');
                            if ($mainPage.length === 1) {
                                $leftTree.appendTo($mainPage);
                                createJstree();
                            } else {
                                $leftTree.appendTo('.TreeContainer');
                                createJstree();
                            }
                        }, cssClass: 'mobile-panel mobile-menu'
                    });
                    $leftTree.trigger('after_open')
                } else {
                    changeTreeSize(false);
                }

            });
            $('#TreeMinimizer').on('click', function () {
                changeTreeSize(true);
            });

            if (TreeMinimizerStorage === true) {
                setTimeout(function () {
                    changeTreeSize(TreeMinimizerStorage);
                }, 1);

            } else if (isMobile) {
                setTimeout(function () {
                    if ($('#page-tree').length === 1) {
                        $leftTree.appendTo($('#page-tree'));
                    }
                    createJstree();
                }, 10);
            } else {
                createJstree();
            }

        }

    }
)();