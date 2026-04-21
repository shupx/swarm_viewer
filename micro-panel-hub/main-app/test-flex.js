import { Model } from 'flexlayout-react';
const defaultConfig = {
  global: {
    tabEnableClose: true,
  },
  borders: [],
  layout: {
    type: 'row',
    id: 'layout-root',
    children: [
      {
        type: 'tabset',
        id: 'main_tabset',
        children: [
          {
            type: 'tab',
            name: 'Welcome',
            component: 'welcome',
          },
        ],
      },
    ],
  },
};
console.log(Model.fromJson(defaultConfig));
