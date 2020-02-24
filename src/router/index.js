import { Home } from '../pages/Home'
import { About } from '../pages/About'
import { Game } from '../pages/Game'
import { Desk } from '../pages/Game/desk';

let routes = [
    {
        name: 'home',
        url: '/',
        component: Home,
        exact: true
    },
    {
        name: 'about',
        url: '/about',
        component: About,
        exace: true
    },
    {
        name: 'game',
        url: '/game',
        component: Game,
        exace: true
    },
    {
        name: 'desk',
        url: '/desk/:id',
        component: Desk,
        exace: true
    }
    // {
    //     url: '**',
    //     component: Page404
    // }
];

let routesMap = {};

routes.forEach((route) => {
    if(route.hasOwnProperty('name')){
        routesMap[route.name] = route.url;
    }
});

let urlBuilder = function(name, params){
    if(!routesMap.hasOwnProperty(name)){
        return null;
    }

    let url = routesMap[name]; // news/:id

    for(let key in params){
        url = url.replace(':' + key, params[key]);
    }

    return url;
}

export default routes;
export {routesMap, urlBuilder};