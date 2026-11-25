import { Category } from '../../../../modules/library/entities/category.entity';

export const CategoriesData: Pick<Category, 'name' | 'description'>[] = [
  {
    name: 'Fiction',
    description: 'Novels and short stories',
  },
  {
    name: 'Non-fiction',
    description: 'Biography, history, essays',
  },
  {
    name: 'Science and Technology',
    description: 'Programming, engineering, physics',
  },
  {
    name: 'Self-help',
    description: 'Productivity, habits, mindset',
  },
  {
    name: "Children's",
    description: 'Picture books, early readers',
  },
];
