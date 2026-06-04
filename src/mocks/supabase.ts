import { mockGuides } from './guides';
import { mockSlots } from './slots';

export const mockSupabase = {
  guides: {
    async list() {
      return mockGuides;
    },
  },
  slots: {
    async list() {
      return mockSlots;
    },
  },
};
