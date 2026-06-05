import { mockGuides } from '../src/mocks/guides';
import { mockSlots } from '../src/mocks/slots';
import { fetchAvailableSlots, fetchGuides } from '../src/services/slotService';

describe('slotService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('returns mock guides when mock mode is active', async () => {
    const promise = fetchGuides();

    jest.advanceTimersByTime(300);

    await expect(promise).resolves.toEqual(mockGuides);
  });

  it('filters mock slots by guide', async () => {
    const guideId = mockGuides[0].id;
    const promise = fetchAvailableSlots(guideId);

    jest.advanceTimersByTime(300);

    await expect(promise).resolves.toEqual(mockSlots.filter((slot) => slot.guideId === guideId));
  });
});
