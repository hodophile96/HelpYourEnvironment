import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ContactUs() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.info}>Email: contact@example.com</Text>
      <Text style={styles.info}>Phone: +123-456-7890</Text>
      <Text style={styles.info}>Address: 123 Main Street, City, Country</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    lineHeight: 24,
  },
});
