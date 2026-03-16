const menu = {
    list() {
        return [
            {
                backMenu: [
                    {
                        menu: '用户管理',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-cardboard',
                                buttons: ['新增', '查看', '修改', '删除'],
                                menu: '用户',
                                menuJump: '列表',
                                tableName: 'yonghu'
                            }
                        ]
                    },
                    {
                        menu: '公交路线',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-clothes',
                                buttons: ['新增', '查看', '修改', '删除', '查看评论'],
                                menu: '公交路线',
                                menuJump: '列表',
                                tableName: 'gongjiaoluxian'
                            }
                        ]
                    },
                    {
                        menu: '网站公告',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-full',
                                buttons: ['新增', '查看', '修改', '删除', '查看评论'],
                                menu: '网站公告',
                                menuJump: '列表',
                                tableName: 'wangzhangonggao'
                            }
                        ]
                    },
                    {
                        menu: '友情链接',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-medal',
                                buttons: ['新增', '查看', '修改', '删除'],
                                menu: '友情链接',
                                menuJump: '列表',
                                tableName: 'youqinglianjie'
                            }
                        ]
                    },
                    {
                        menu: '留言建议',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-message',
                                buttons: ['查看', '修改', '回复', '删除'],
                                menu: '留言建议',
                                tableName: 'messages'
                            }
                        ]
                    },
                    {
                        menu: '互动审核',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-service',
                                buttons: ['查看', '修改', '删除'],
                                menu: '在线提问',
                                tableName: 'chat'
                            },
                            {
                                appFrontIcon: 'cuIcon-message',
                                buttons: ['查看', '修改', '删除'],
                                menu: '公交路线评论',
                                tableName: 'discussgongjiaoluxian'
                            },
                            {
                                appFrontIcon: 'cuIcon-message',
                                buttons: ['查看', '修改', '删除'],
                                menu: '网站公告评论',
                                tableName: 'discusswangzhangonggao'
                            }
                        ]
                    },
                    {
                        menu: '展示配置',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-copy',
                                buttons: ['查看', '修改', '删除'],
                                menu: '轮播图管理',
                                tableName: 'config'
                            }
                        ]
                    }
                ],
                frontMenu: [
                    {
                        menu: '公交路线模块',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-medal',
                                buttons: ['查看'],
                                menu: '公交路线列表',
                                menuJump: '列表',
                                tableName: 'gongjiaoluxian'
                            }
                        ]
                    },
                    {
                        menu: '网站公告模块',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-taxi',
                                buttons: ['查看'],
                                menu: '网站公告列表',
                                menuJump: '列表',
                                tableName: 'wangzhangonggao'
                            }
                        ]
                    },
                    {
                        menu: '友情链接模块',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-discover',
                                buttons: ['查看'],
                                menu: '友情链接列表',
                                menuJump: '列表',
                                tableName: 'youqinglianjie'
                            }
                        ]
                    }
                ],
                hasBackLogin: '是',
                hasBackRegister: '否',
                hasFrontLogin: '否',
                hasFrontRegister: '否',
                roleName: '管理员',
                tableName: 'users'
            },
            {
                backMenu: [
                    {
                        menu: '留言建议',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-message',
                                buttons: ['查看', '删除'],
                                menu: '留言建议',
                                tableName: 'messages'
                            }
                        ]
                    }
                ],
                frontMenu: [
                    {
                        menu: '公交路线模块',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-medal',
                                buttons: ['查看'],
                                menu: '公交路线列表',
                                menuJump: '列表',
                                tableName: 'gongjiaoluxian'
                            }
                        ]
                    },
                    {
                        menu: '网站公告模块',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-taxi',
                                buttons: ['查看'],
                                menu: '网站公告列表',
                                menuJump: '列表',
                                tableName: 'wangzhangonggao'
                            }
                        ]
                    },
                    {
                        menu: '友情链接模块',
                        child: [
                            {
                                appFrontIcon: 'cuIcon-discover',
                                buttons: ['查看'],
                                menu: '友情链接列表',
                                menuJump: '列表',
                                tableName: 'youqinglianjie'
                            }
                        ]
                    }
                ],
                hasBackLogin: '是',
                hasBackRegister: '否',
                hasFrontLogin: '是',
                hasFrontRegister: '是',
                roleName: '用户',
                tableName: 'yonghu'
            }
        ];
    }
};
export default menu;
