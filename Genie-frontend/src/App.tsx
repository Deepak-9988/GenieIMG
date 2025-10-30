import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Signup from "./screens/Signup";
import Login from "./screens/Login";
import HomeTabs from "./screens/HomeTabs";
import { HistoryProvider } from "./context/HistoryContext";

const Stack = createNativeStackNavigator();

export default function App() {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  // Check token when app loads
  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      setHasToken(!!token);
    } catch {
      setHasToken(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  if (hasToken === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  // ✅ Custom theme to color navigation background (helps Android match status bar)
  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#1565c0", // same as status bar blue
    },
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1565c0" }}>
        {/* ✅ Force blue status bar */}
        <StatusBar
          translucent={false}
          backgroundColor="#1565c0"
          barStyle="light-content"
        />

        <HistoryProvider>
          <NavigationContainer theme={MyTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {hasToken ? (
                <Stack.Screen name="Home">
                  {props => <HomeTabs {...props} setHasToken={setHasToken} />}
                </Stack.Screen>
              ) : (
                <>
                  <Stack.Screen name="Login">
                    {props => <Login {...props} setHasToken={setHasToken} />}
                  </Stack.Screen>
                  <Stack.Screen name="Signup" component={Signup} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </HistoryProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
