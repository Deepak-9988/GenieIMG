// screens/Home.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function Home({ navigation }) {
  return (
    <LinearGradient
      colors={["#6a11cb", "#2575fc"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6a11cb" />

      {/* Heading */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome 👋</Text>
        <Text style={styles.subtitle}>GenieIMG Dashboard</Text>
      </View>

      {/* Action Cards */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Generate")}
        >
          <LinearGradient
            colors={["#ff9a9e", "#fecfef"]}
            style={styles.card}
          >
            <Ionicons name="color-wand" size={32} color="#fff" />
            <Text style={styles.cardText}>Generate Image</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("History")}
        >
          <LinearGradient
            colors={["#84fab0", "#8fd3f4"]}
            style={styles.card}
          >
            <Ionicons name="time" size={32} color="#fff" />
            <Text style={styles.cardText}>View History</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Profile")}
        >
          <LinearGradient
            colors={["#a18cd1", "#fbc2eb"]}
            style={styles.card}
          >
            <Ionicons name="person-circle" size={32} color="#fff" />
            <Text style={styles.cardText}>Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 18,
    color: "#e0e0e0",
    marginTop: 6,
  },
  buttonContainer: {
    flex: 1,
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    width: 320,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cardText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 15,
  },
});
