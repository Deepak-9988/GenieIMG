import * as React from "react";
import { Dimensions, StyleSheet, StatusBar } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

import Generate from "./Generate";
import History from "./History";
import Profile from "./Profile";

const initialLayout = { width: Dimensions.get("window").width };

export default function HomeTabs({ setHasToken }) {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "generate", title: "Generate" },
    { key: "history", title: "History" },
    { key: "profile", title: "Profile" },
  ]);

  // Pass setHasToken to Profile scene
  const renderScene = SceneMap({
    generate: Generate,
    history: History,
    profile: props => <Profile {...props} setHasToken={setHasToken} />,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.label}
    />
  );

  return (
    <>
      <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
        style={styles.container}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  tabBar: {
    backgroundColor: "#1565c0",
    elevation: 0,
    shadowOpacity: 0,
  },
  label: { color: "#fff", fontWeight: "bold" },
  indicator: { backgroundColor: "#fff", height: 3 },
});
