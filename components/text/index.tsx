import { colors } from '@/styles/colors';
import React from 'react';
import { Text, StyleSheet, TextProps, TextStyle } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

type Variant = 'body' | 'title' | 'subtitle' | 'caption' | 'error';

interface CustomTextProps extends TextProps {
  variant?: Variant;
  style?: TextStyle;
  children: React.ReactNode;
}

export default function CustomText({
  children,
  style,
  variant = 'body',
  ...props
}: CustomTextProps) {
  let fontSize = moderateScale(14);

  if (variant === 'title') {
    fontSize = moderateScale(30);
  }

  return (
    <Text
      style={{
        fontSize,
        fontFamily: 'Raleway',
        fontWeight: 'bold',
        color: colors.white[100],
        textAlign: 'center',
      }}
      {...props}
    >
      {children}
    </Text>
  );
}
