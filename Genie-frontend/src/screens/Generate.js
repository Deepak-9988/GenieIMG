// screens/Generate.js
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { HistoryContext } from "../context/HistoryContext";
import { useNavigation, CommonActions } from "@react-navigation/native"; // ✅ added navigation

const API = "http://192.168.1.2:5000"; // Backend IP

export default function Generate() {
  const navigation = useNavigation();
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [showSlogan, setShowSlogan] = useState(true);
  const inputRef = useRef(null);

  const { history, addHistoryItem, setHistory } = useContext(HistoryContext);

  const topAnim = useRef(new Animated.Value(-200)).current;
  const bottomAnim = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const sloganFade = useRef(new Animated.Value(0)).current;

  // Animate on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(topAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(bottomAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(sloganFade, { toValue: 1, duration: 1200, useNativeDriver: true }).start();
      setTimeout(() => inputRef.current?.focus(), 200);
    });
  }, []);

  // Fetch history from backend on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch history");

        const data = await res.json();
        console.log("Fetched history:", data);
        setHistory(data);
      } catch (err) {
        console.error("Fetch history error:", err);
      }
    };
    fetchHistory();
  }, [setHistory]);

  const handleGenerate = async () => {
    Keyboard.dismiss();
    if (!prompt.trim()) return alert("Please enter a prompt");

    try {
      setLoading(true);
      setShowSlogan(false);

      const token = await AsyncStorage.getItem("token");
      if (!token) return alert("You must be logged in!");

      console.log("Generating image for prompt:", prompt);

      const res = await fetch(`${API}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend error:", errorText);
        throw new Error("Failed to generate image");
      }

      const data = await res.json();
      if (!data.image) throw new Error("No image returned from backend");

      setImage(data.image);
      console.log("Image generated successfully:", data._id);

      // Create timestamp if backend doesn't return it
      const now = new Date().toISOString();

      const newItem = {
        _id: data._id || `${Date.now()}`, // fallback unique ID
        prompt: data.prompt || prompt,
        image: data.image,
        date: data.createdAt || now, // use backend or frontend timestamp
      };

      // Add new item at the top of history
      addHistoryItem(newItem);
    } catch (err) {
      console.error("Image generation error:", err.message);
      alert("Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt("");
    inputRef.current?.blur();
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
      else setInputKey((k) => k + 1);
    }, 20);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient colors={["#0d47a1", "#1565c0", "#1e88e5"]} style={styles.wrapper}>
        <Animated.View style={[styles.topCurve, { opacity, transform: [{ translateY: topAnim }] }]} pointerEvents="none">
          <LinearGradient colors={["#1e3c72", "#2a5298"]} style={styles.fill} />
        </Animated.View>

        {showSlogan && !image && (
          <Animated.View style={[styles.sloganWrapper, { opacity: sloganFade }]} pointerEvents="none">
            <Text style={styles.sloganText}>✨ Unleash Your Creativity with GenieIMG ✨</Text>
          </Animated.View>
        )}

        <View style={styles.contentWrapper}>
          <LinearGradient colors={["#1565c0", "#1e88e5"]} style={styles.titleWrapper}>
            <Text style={styles.title}>GenieIMG</Text>
          </LinearGradient>

          <View style={styles.inputContainer}>
            <TextInput
              key={inputKey}
              ref={inputRef}
              style={styles.input}
              placeholder="Type a prompt..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={prompt}
              onChangeText={setPrompt}
              returnKeyType="done"
            />
            {prompt.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                <Ionicons name="close-circle" size={22} color="#90caf9" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={handleGenerate} disabled={loading} style={styles.button}>
            <LinearGradient colors={["#1976d2", "#42a5f5"]} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>{loading ? "Generating..." : "Generate"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {image && (
            <View style={styles.imageCard}>
              <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
              <Text style={styles.promptText}>{prompt}</Text>
            </View>
          )}
        </View>

        <Animated.View style={[styles.bottomCurve, { opacity, transform: [{ translateY: bottomAnim }] }]} pointerEvents="none">
          <LinearGradient colors={["#1565c0", "#0d47a1"]} style={styles.fill} />
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  contentWrapper: { flex: 1, padding: 20, paddingBottom: 40, zIndex: 1 },
  titleWrapper: { alignSelf: "center", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 25, elevation: 6, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6 },
  title: { fontSize: 32, fontWeight: "900", textAlign: "center", color: "#fff", letterSpacing: 1.2, textShadowColor: "rgba(0,0,0,0.3)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderRadius: 14, paddingRight: 8, backgroundColor: "rgba(255,255,255,0.1)", marginBottom: 18 },
  input: { flex: 1, padding: 14, fontSize: 16, color: "#fff" },
  clearButton: { padding: 6 },
  button: { marginVertical: 12 },
  buttonGradient: { padding: 16, borderRadius: 14, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  sloganWrapper: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", backgroundColor: "transparent" },
  sloganText: { fontSize: 18, fontWeight: "700", top: 20, textAlign: "center", color: "#fff", letterSpacing: 0.8, lineHeight: 25, textShadowColor: "rgba(0,0,0,0.4)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6, paddingHorizontal: 20 },
  imageCard: { marginTop: 25, backgroundColor: "#1e3c72", borderRadius: 16, padding: 14, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 5, zIndex: 2 },
  image: { width: "100%", height: 320, borderRadius: 12 },
  promptText: { marginTop: 12, fontSize: 16, fontWeight: "500", textAlign: "center", color: "#fff" },
  topCurve: { position: "absolute", top: 0, left: 0, right: 0, height: 280, borderBottomRightRadius: 80, overflow: "hidden", zIndex: 0 },
  bottomCurve: { position: "absolute", bottom: 0, left: 0, right: 0, height: 160, borderTopLeftRadius: 100, overflow: "hidden", zIndex: 0 },
  fill: { flex: 1 },
});
