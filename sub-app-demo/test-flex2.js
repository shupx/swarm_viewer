import { Model, Actions } from 'flexlayout-react';
const defaultConfig = {
  global: { tabEnableClose: true },
  borders: [],
  layout: {
    type: 'row',
    id: 'main-row',
    children: [
      {
        type: 'tabset',
        id: 'main_tabset',
        children: [ { type: 'tab', name: 'Welcome', component: 'welcome' } ],
      },
    ],
  },
};
const model = Model.fromJson(defaultConfig);
console.log('Active tabset:', model.getActiveTabset()?.getId());

const allNodes = [];
model.visitNodes((n) => allNodes.push(n));
const tabsets = allNodes.filter(n => n.getType() === 'tabset');
console.log('Tabsets:', tabsets.map(n=>n.getId()));

const nodeToAdd = { type: 'tab', name: 'Test', component: 'sub-app' };
// try adding to the first tabset
if (tabsets.length > 0) {
  model.doAction(Actions.addNode(nodeToAdd, tabsets[0].getId(), "center", -1));
  console.log('Added normally');
}
