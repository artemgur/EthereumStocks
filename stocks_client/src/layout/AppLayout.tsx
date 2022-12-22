import React, {useContext, useMemo} from 'react';
import {
    UserOutlined,
    FormOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {EthereumContext} from "../contexts/EthereumContext";

const { Header, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const AppLayout: React.FC = () => {
    const navigate = useNavigate();

    const { status } = useContext(EthereumContext);

    const onClick: MenuProps['onClick'] = (e) => {
        navigate(e.key);
    };

    const stocksMenu: MenuItem[] = useMemo(() => {
        const items = [
            getItem('Все акции', '/stocks'),
            getItem('Мои акции', '/stocks/my')
        ];
        if (status === "director") {
            items.push(
                getItem('Выпустить акции', '/stocks/create')
            );
        }

        return items;
    }, [status]);

    const items: MenuItem[] = [
        getItem('Профиль', 'account', <UserOutlined />, [
            getItem('Мой профиль', '/'),
            getItem('Мои транзакции', '/account/transactions'),
        ]),
        getItem('Акции', 'stocks', <UnorderedListOutlined />, stocksMenu),
        getItem('Ордеры', 'orders', <FormOutlined />, [
            getItem('Мои ордеры', '/orders'),
            getItem('Создать ордер', '/orders/create'),
        ]),
    ];

    const location = useLocation();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ padding: 0 }} >
                <Menu
                    theme="light"
                    defaultSelectedKeys={[location.pathname]}
                    onClick={onClick}
                    items={items}
                    mode="horizontal"
                />
            </Header>
            <Content style={{ margin: '0 16px' }}>
                <Outlet/>
            </Content>
        </Layout>
    );
};

export default AppLayout;
