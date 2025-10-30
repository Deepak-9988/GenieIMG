// screens/Login.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "http://192.168.1.2:5000"; // Your backend IP

export default function Login({ navigation, setHasToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Animation refs
  const topAnim = useRef(new Animated.Value(-200)).current;
  const bottomAnim = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // Animate on mount
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

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Please fill all fields" });
      return;
    }

    setLoginLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      console.log("Login response text:", text);

      let data = {};
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse login response:", text, err);
        Toast.show({ type: "error", text1: "Server returned invalid data" });
        setLoginLoading(false);
        return;
      }

      if (!res.ok) {
        Toast.show({ type: "error", text1: data.error || "Login failed" });
        setLoginLoading(false);
        return;
      }

      if (!data.token) {
        Toast.show({ type: "error", text1: "Login failed: token missing" });
        setLoginLoading(false);
        return;
      }

      // Save token & user info
      await AsyncStorage.setItem("token", data.token);
      const userData = {
        name: data.username || "User",
        email: data.email,
        joinedDate: data.joinedDate || new Date().toISOString(),
      };
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      Toast.show({ type: "success", text1: "Login successful!" });

      // ✅ Just update state, App.tsx will swap stack
      setHasToken(true);
    } catch (err) {
      console.error("Login error:", err);
      Toast.show({ type: "error", text1: "Network error" });
    } finally {
      setLoginLoading(false);
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

          <Text style={styles.title}>Login</Text>

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

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            <LinearGradient
              colors={["#1976d2", "#42a5f5"]}
              style={styles.buttonGradient}
            >
              {loginLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            style={{ marginTop: 15 }}
          >
            <Text style={styles.linkText}>Don’t have an account? Signup</Text>
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
