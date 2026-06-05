import { confirmMockPayment } from '../src/mocks/payment';
import { mockGuides } from '../src/mocks/guides';
import { mockSlots } from '../src/mocks/slots';

describe('confirmMockPayment', () => {
  it('returns a confirmed booking with an end time', async () => {
    const result = await confirmMockPayment({
      guide: mockGuides[0],
      slot: mockSlots[0],
    });

    expect(result.status).toBe('confirmed');
    expect(result.endTime).toBeTruthy();
    expect(result.slotId).toBe(mockSlots[0].id);
  });
});
