import React from 'react';
import { View } from 'react-native';

type SliderProps = {
  testID?: string;
};

export function Slider({ testID = 'mock-slider' }: SliderProps) {
  return <View testID={testID} />;
}
