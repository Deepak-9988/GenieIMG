import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Share,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import RNFS from "react-native-fs";
import CameraRoll from "@react-native-camera-roll/camera-roll";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HistoryContext } from "../context/HistoryContext";

const { width } = Dimensions.get("window");
const API = "http://192.168.1.2:5000"; // replace with your backend IP

const formatDateTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function History() {
  const { history, setHistory } = useContext(HistoryContext);
  const [loading, setLoading] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,
      onPanResponderMove: (_, g) => pan.setValue({ x: g.dx, y: 0 }),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 50) closePopup();
        else
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
      },
    })
  ).current;

  const openPopup = (item) => {
    setSelectedItem(item);
    setPopupVisible(true);
    pan.setValue({ x: 0, y: 0 });
  };

  const closePopup = () => {
    setPopupVisible(false);
    setSelectedItem(null);
  };

  // ✅ Download image using CameraRoll (works on Android/iOS)
  const handleDownload = async () => {
    if (!selectedItem?.image) return;
    try {
      await CameraRoll.save(selectedItem.image, { type: "photo", album: "GenieIMG" });
      Alert.alert("✅ Success", "Image saved to your gallery!");
    } catch (err) {
      console.log("Download error:", err);
      Alert.alert("❌ Failed", "Could not save the image. Try again.");
    }
  };

  // ✅ Share image (download to cache first)
  const handleShare = async () => {
    if (!selectedItem?.image) return;

    try {
      const filename = `GenieIMG_share_${Date.now()}.jpg`;
      const path = `${RNFS.CachesDirectoryPath}/${filename}`;

      await RNFS.downloadFile({ fromUrl: selectedItem.image, toFile: path }).promise;

      await Share.share({
        title: "GenieIMG Image",
        message: "✨ Image created in GenieIMG!",
        url: Platform.OS === "android" ? `file://${path}` : path,
      });
    } catch (err) {
      console.log("Share error:", err);
      Alert.alert("❌ Failed", "Unable to share image.");
    }
  };

  // ✅ Fetch history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Fetch history error:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const renderItem = ({ item, index }) => {
    const formattedDate = formatDateTime(item.createdAt || item.date);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.card, { marginBottom: index === history.length - 1 ? 80 : 16 }]}
        onPress={() => openPopup(item)}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.prompt} numberOfLines={2}>
            {item.prompt}
          </Text>
          {(item.createdAt || item.date) && (
            <Text style={styles.date}>{formattedDate || "Fetching date..."}</Text>
          )}
        </View>
        <Text style={styles.arrow}>➔</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={["#0d47a1", "#1565c0", "#1e88e5"]} style={styles.container}>
      <ImageBackground
        source={require("../../assets/hourglass.png")}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.05, resizeMode: "contain" }}
      />

      <Text style={styles.title}>📜 History</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 12 }}>Loading history...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.noHistoryText}>No history yet. Try generating some images!</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Popup Modal */}
      <Modal visible={popupVisible} transparent animationType="fade" onRequestClose={closePopup}>
        <TouchableWithoutFeedback onPress={closePopup}>
          <View style={styles.modalBackground}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[styles.modalContent, { transform: [{ translateX: pan.x }] }]}
            >
              <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>

              {selectedItem && (
                <>
                  <Image source={{ uri: selectedItem.image }} style={styles.modalImage} />
                  <Text style={styles.modalPrompt}>{selectedItem.prompt}</Text>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
                      <Text style={styles.actionText}>⬇️ Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                      <Text style={styles.actionText}>📤 Share</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 18,
    color: "#fff",
    letterSpacing: 1.1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 30,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    shadowColor: "#49a4ffff",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  image: {
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  textContainer: { flex: 1 },
  prompt: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 6 },
  date: { fontSize: 13, fontWeight: "400", color: "#cfd8ff" },
  arrow: { fontSize: 22, color: "#fff", marginLeft: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  noHistoryText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    borderRadius: 20,
    backgroundColor: "rgba(27, 36, 52, 0.9)",
    padding: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: -44,
    right: 1,
    zIndex: 5,
    padding: 6,
  },
  closeText: { fontSize: 22, color: "#fff" },
  modalImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  modalPrompt: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
