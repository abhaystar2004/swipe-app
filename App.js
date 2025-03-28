import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  Animated,
  PanResponder,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

const UserData = [
  { id: "1", uri: require("./assets/1.jpg") },
  { id: "2", uri: require("./assets/2.jpg") },
  { id: "3", uri: require("./assets/3.jpg") },
  { id: "4", uri: require("./assets/4.jpg") },
  { id: "5", uri: require("./assets/5.jpg") },
];

export default function App() {
  // Use cards array instead of currentIndex
  const [cards, setCards] = useState(UserData);
  const position = new Animated.ValueXY();

  // Array destructuring to separate top card from rest
  const [topCard, ...remainingCards] = cards.length > 0 ? cards : [null, []];

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-30deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const rotateAndTranslate = {
    transform: [{ rotate: rotate }, ...position.getTranslateTransform()],
  };

  const likeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 0],
    extrapolate: "clamp",
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 1],
    extrapolate: "clamp",
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.8, 1],
    extrapolate: "clamp",
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      position.setValue({ x: gestureState.dx, y: gestureState.dy });
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Check if this is a partial swipe (not meeting threshold)
      if (Math.abs(gestureState.dx) < 120) {
        // Reset position with animation
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 4,
          tension: 40, // Add tension for better spring behavior
          useNativeDriver: false,
        }).start();
      } else {
        // Complete the swipe as before
        const offScreenX =
          gestureState.dx > 0 ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
        Animated.timing(position, {
          toValue: { x: offScreenX, y: gestureState.dy },
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          setCards(remainingCards);
          position.setValue({ x: 0, y: 0 });
        });
      }

      // Add this to ensure cleanup of any stuck gesture state
      position.flattenOffset();
    },
  });

  const opacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.25, 1, 0.25],
    extrapolate: "clamp",
  });

  function renderCard(item, isTopCard) {
    if (!item) return null;

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.card,
          isTopCard
            ? { ...rotateAndTranslate, opacity: opacity }
            : {
                opacity: nextCardOpacity,
                transform: [{ scale: nextCardScale }],
              },
        ]}
        {...(isTopCard && panResponder.panHandlers)}
      >
        <Animated.View
          style={[
            styles.likeContainer,
            { opacity: isTopCard ? likeOpacity : 0 },
          ]}
        >
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.nopeContainer,
            { opacity: isTopCard ? dislikeOpacity : 0 },
          ]}
        >
          <Text style={styles.nopeText}>NOPE</Text>
        </Animated.View>

        <Image
          style={{
            flex: 1,
            height: null,
            width: null,
            borderRadius: 20,
          }}
          resizeMode="cover"
          source={item.uri}
        />
      </Animated.View>
    );
  }

  function renderCards() {
    if (cards.length === 0) {
      console.log("Its in cardlength 0")
      return (
        <View style={styles.noMoreCards}>
          <Text>No more cards!</Text>
        </View>
      );
    }

    return (
      <>
        {remainingCards.length > 0 && renderCard(remainingCards[0], false)}
        {topCard && renderCard(topCard, true)}
      </>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header} />
      <View style={styles.content}>{renderCards()}</View>
      <View style={styles.footer} />
      <Text onPress={() => setCards(UserData)}>RESET</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... your existing styles
  container: {
    flex: 1,
  },
  header: {
    height: 60,
  },
  content: {
    flex: 1,
  },
  footer: {
    height: 60,
  },
  card: {
    height: SCREEN_HEIGHT - 120,
    width: SCREEN_WIDTH,
    padding: 10,
    position: "absolute",
  },
  likeContainer: {
    transform: [{ rotate: "-30deg" }],
    position: "absolute",
    top: 50,
    left: 40,
    zIndex: 1000,
  },
  likeText: {
    borderWidth: 1,
    borderColor: "green",
    color: "green",
    fontSize: 32,
    fontWeight: "800",
    padding: 10,
  },
  nopeContainer: {
    transform: [{ rotate: "30deg" }],
    position: "absolute",
    top: 50,
    right: 40,
    zIndex: 1000,
  },
  nopeText: {
    borderWidth: 1,
    borderColor: "red",
    color: "red",
    fontSize: 32,
    fontWeight: "800",
    padding: 10,
  },
  noMoreCards: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
