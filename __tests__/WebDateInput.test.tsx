import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { WebDateInput } from '../src/components/ui/WebDateInput';

describe('WebDateInput', () => {
  it('accepts typed MM/DD/YYYY dates and emits ISO YYYY-MM-DD', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<WebDateInput onChange={onChange} />);

    fireEvent.changeText(getByLabelText('Date of birth'), '04121994');

    expect(onChange).toHaveBeenLastCalledWith('1994-04-12');
  });

  it('emits an empty value while the date is incomplete', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<WebDateInput onChange={onChange} />);

    fireEvent.changeText(getByLabelText('Date of birth'), '0412');

    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('rejects impossible dates without crashing', () => {
    const onChange = jest.fn();
    const { getByLabelText, getByText } = render(<WebDateInput onChange={onChange} />);

    fireEvent.changeText(getByLabelText('Date of birth'), '02312000');

    expect(onChange).toHaveBeenLastCalledWith('');
    expect(getByText('Enter a real date as MM/DD/YYYY.')).toBeTruthy();
  });

  it('formats an existing ISO value for display', () => {
    const { getByDisplayValue } = render(
      <WebDateInput value="1994-04-12" onChange={jest.fn()} />,
    );

    expect(getByDisplayValue('04/12/1994')).toBeTruthy();
  });
});
