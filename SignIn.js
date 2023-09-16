import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function SignIn({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const auth = getAuth(); // Initialize Firebase Authentication

  const handleSignIn = async () => {
    try {
      // Sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);

      // If sign-in is successful, navigate to the Feed page
      navigation.navigate('Feed');
    } catch (error) {
      // Handle sign-in error
      setError('Invalid email or password. Please try again.');
      console.error('Sign-In Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./Logo.png')} style={styles.logo} />
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        title="Sign In"
        onPress={handleSignIn}
        color="#547225" // Set the button color to hex #547225
      />

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>
          Don't have an account with us? <Text style={styles.underlineText}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  signUpText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});