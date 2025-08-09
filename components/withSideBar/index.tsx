import React from 'react';
import { View, StyleSheet } from 'react-native';
import SidebarMenu from '@/components/sideBarMenu';

type WithSidebarProps = {
  children: React.ReactNode;
};

export default function WithSidebar({ children }: WithSidebarProps) {
  return (
    <View style={styles.container}>
      {children}
      <SidebarMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
