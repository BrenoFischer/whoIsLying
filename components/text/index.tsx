import React from 'react';
import { Text, StyleSheet, TextProps, TextStyle } from 'react-native';

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
    let fontSize = 14;

    if(variant === 'title') {
        fontSize = 18
    }

  return (
    <Text style={{fontSize, fontFamily: 'Sigmar'}} {...props}>
      {children}
    </Text>
  );
};