import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>GuavaBank</Text>
        <Text style={styles.subtitle}>Banco digital em ambiente de simulação</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f7f8f4" },
  title: { fontSize: 32, fontWeight: "700", color: "#173b2f" },
  subtitle: { marginTop: 8, fontSize: 16, color: "#496156" }
});
