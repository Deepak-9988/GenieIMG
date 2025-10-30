// screens/Profile.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import Toast from "react-native-toast-message";

const API = "http://192.168.1.2:5000";

export default function Profile({ setHasToken }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Load cached user
        const cached = await AsyncStorage.getItem("user");
        if (cached) setUser(JSON.parse(cached));

        // Fetch profile from API
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          const userData = {
            name: data.username || "User",
            email: data.email || "—",
            joinedDate: data.joinedDate || new Date().toISOString(),
          };
          setUser(userData);
          await AsyncStorage.setItem("user", JSON.stringify(userData));
        } else {
          Toast.show({
            type: "error",
            text1: data.error || "Failed to fetch profile",
          });
        }
      } catch (err) {
        console.log("Failed to fetch profile:", err);
        Toast.show({ type: "error", text1: "Network error" });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
      Toast.show({ type: "success", text1: "Logged out successfully" });

      // ⚡ Update App state to show Login screen
      if (setHasToken) setHasToken(false);
    } catch (err) {
      console.log("Logout error:", err);
      Toast.show({ type: "error", text1: "Failed to logout" });
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#0d47a1", "#1565c0", "#1e88e5"]}
        style={styles.center}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0d47a1", "#1565c0", "#1e88e5"]}
      style={styles.container}
    >
      <ImageBackground
        source={require("../../assets/fingerprint.png")}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.06, resizeMode: "contain" }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>👤 Profile</Text>

          <View style={styles.infoSection}>
            <Text style={[styles.infoLabel, styles.nameLabel]}>Name</Text>
            <Text style={styles.infoText}>
              {user?.name ? user.name.toUpperCase() : "—"}
            </Text>

            <Text style={[styles.infoLabel, { marginTop: 14 }]}>Email</Text>
            <Text style={styles.infoText}>{user?.email || "—"}</Text>

            <Text style={[styles.infoLabel, { marginTop: 14 }]}>Member Since</Text>
            <Text style={styles.infoText}>
              {user?.joinedDate
                ? new Date(user.joinedDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButtonWrapper}
            onPress={handleLogout}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#e74c3c", "#ff3b30"]}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>🚪 Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <Toast />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    paddingTop: 50,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    shadowColor: "#49a4ffff",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    zIndex: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 1.1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  infoSection: { width: "100%", marginBottom: 25 },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cfd8ff",
    paddingLeft: 20,
  },
  nameLabel: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#cfd8ff",
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    paddingLeft: 20,
    color: "#fff",
    marginTop: 4,
  },
  logoutButtonWrapper: {
    width: "70%",
    borderRadius: 14,
    overflow: "hidden",
    alignSelf: "center",
    shadowColor: "#ff3b30",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  logoutButton: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
