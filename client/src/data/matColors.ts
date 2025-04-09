import { MatColor } from '@shared/schema';

export const matColorCatalog: MatColor[] = [
  {
    id: 'white',
    name: 'White',
    color: '#FFFFFF',
    price: 0.02 // per square inch (wholesale)
  },
  {
    id: 'black',
    name: 'Black',
    color: '#2C2C2C',
    price: 0.025 // per square inch (wholesale)
  },
  {
    id: 'grey',
    name: 'Grey',
    color: '#ADADAD',
    price: 0.02 // per square inch (wholesale)
  },
  {
    id: 'beige',
    name: 'Beige',
    color: '#F5F5DC',
    price: 0.02 // per square inch (wholesale)
  }
];

// Helper function to get mat color by ID
export const getMatColorById = (id: string): MatColor | undefined => {
  return matColorCatalog.find(mat => mat.id === id);
};
