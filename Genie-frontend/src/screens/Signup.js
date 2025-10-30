// screens/Signup.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "http://192.168.1.2:5000";

export default function Signup({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Animation refs
  const topAnim = useRef(new Animated.Value(-200)).current;
  const bottomAnim = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(topAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(bottomAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.04, duration: 1600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Toast.show({ type: "error", text1: "Please fill all fields" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        Toast.show({ type: "error", text1: data.error || "Signup failed" });
        setLoading(false);
        return;
      }

      // Save user info in AsyncStorage
      const userData = {
        name: username,
        email: email,
        joinedDate: new Date().toISOString(),
      };
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      Toast.show({ type: "success", text1: "Signup successful!" });
      navigation.navigate("Login");
    } catch (err) {
      console.error("Signup error:", err);
      Toast.show({ type: "error", text1: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#0d47a1", "#1565c0", "#1e88e5"]}
        style={styles.wrapper}
      >
        {/* Top Curve */}
        <Animated.View
          style={[styles.topCurve, { opacity, transform: [{ translateY: topAnim }] }]}
          pointerEvents="none"
        >
          <LinearGradient colors={["#1e3c72", "#2a5298"]} style={styles.fill} />
        </Animated.View>

        {/* Content */}
        <View style={styles.contentWrapper}>
          <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
            <LinearGradient
              colors={["#1565c0", "#1e88e5"]}
              style={styles.titleWrapper}
            >
              <Text style={styles.titleText}>GenieIMG</Text>
            </LinearGradient>
          </Animated.View>

          <Text style={styles.title}>Create Account</Text>

          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.6)"
          />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="rgba(255,255,255,0.6)"
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            placeholderTextColor="rgba(255,255,255,0.6)"
          />

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            <LinearGradient colors={["#1976d2", "#42a5f5"]} style={styles.buttonGradient}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Signup</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={{ marginTop: 15 }}
          >
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Curve */}
        <Animated.View
          style={[styles.bottomCurve, { opacity, transform: [{ translateY: bottomAnim }] }]}
          pointerEvents="none"
        >
          <LinearGradient colors={["#1565c0", "#0d47a1"]} style={styles.fill} />
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, position: "relative" },
  contentWrapper: { flex: 1, padding: 20, justifyContent: "center", zIndex: 1 },
  titleWrapper: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: -155,
    marginBottom: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  titleText: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center", letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: "#fff", letterSpacing: 1 },
  input: { borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16, color: "#fff" },
  button: { marginTop: 10 },
  buttonGradient: { padding: 15, borderRadius: 10, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkText: { color: "#bbdefb", fontSize: 16, textAlign: "center" },
  topCurve: { position: "absolute", top: 0, left: 0, right: 0, height: 180, borderBottomRightRadius: 80, overflow: "hidden", zIndex: 0 },
  bottomCurve: { position: "absolute", bottom: 0, left: 0, right: 0, height: 170, borderTopLeftRadius: 100, overflow: "hidden", zIndex: 0 },
  fill: { flex: 1 },
});
