import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import InfoScreen from "./screens/InfoScreen";
import LogScreen from "./screens/LogScreen";
import Colors from "./Colors";
import { TouchableOpacity, Image, View, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";
import * as Animatable from "react-native-animatable";

const Tab = createBottomTabNavigator();

const tabArr = [
	{
		route: "Info",
		label: "Info",
		icon: require("./assets/info-solid.png"),
		component: InfoScreen,
	},
	{
		route: "Home",
		label: "Home",
		icon: require("./assets/house-solid.png"),
		component: HomeScreen,
	},
	{
		route: "Logs",
		label: "Logs",
		icon: require("./assets/clipboard-regular.png"),
		component: LogScreen,
	},
];

const animate1 = {
	0: { scale: 0.5, translateY: 7 },
	0.92: { translateY: -34 },
	1: { scale: 1.2, translateY: -24 },
};

const animate2 = {
	0: { scale: 1.2, translateY: -24 },
	1: { scale: 1, translateY: 7 },
};

const circle1 = {
	0: { scale: 0 },
	0.3: { scale: 0.9 },
	0.5: { scale: 0.2 },
	0.8: { scale: 0.7 },
	1: { scale: 1 },
};

const circle2 = {
	0: { scale: 1 },
	1: { scale: 0 },
};

const TabButton = (props) => {
	const { item, onPress, accessibilityState } = props;
	const focused = accessibilityState.selected;

	const viewRef = useRef(null);
	const circleRef = useRef(null);
	const textRef = useRef(null);

	useEffect(() => {
		if (focused) {
			viewRef.current.animate(animate1);
			circleRef.current.animate(circle1);
			textRef.current.transitionTo({ scale: 1 });
		} else {
			viewRef.current.animate(animate2);
			circleRef.current.animate(circle2);
			textRef.current.transitionTo({ scale: 0 });
		}
	}, [focused]);

	return (
		<TouchableOpacity
			onPress={onPress}
			style={styles.container}
			activeOpacity={1}
		>
			<Animatable.View
				style={styles.container}
				ref={viewRef}
				duration={200}
			>
				<View
					style={[
						styles.btn,
						{
							borderColor: focused
								? Colors.darkPurple
								: Colors.darkPurple,
						},
					]}
				>
					<Animatable.View
						style={styles.circle}
						ref={circleRef}
						duration={200}
					/>
					<Image
						resizeMode="contain"
						source={item.icon}
						style={{
							height: 24,
							width: 24,
							tintColor: Colors.white,
						}}
					/>
				</View>
				<Animatable.Text
					style={styles.text}
					ref={textRef}
					duration={200}
				>
					{item.label}
				</Animatable.Text>
			</Animatable.View>
		</TouchableOpacity>
	);
};

const App = () => {
	return (
		<NavigationContainer>
			<Tab.Navigator
				screenOptions={{
					headerShown: false,
					tabBarStyle: {
						position: "absolute",
						height: 70,
						bottom: 24,
						right: 16,
						left: 16,
						borderRadius: 16,
						backgroundColor: Colors.darkPurple,
						borderTopWidth: 1,
					},
				}}
			>
				{tabArr.map((item, index) => {
					return (
						<Tab.Screen
							key={index}
							name={item.route}
							component={item.component}
							options={{
								tabBarShowLabel: false,
								tabBarButton: (props) => (
									<TabButton {...props} item={item} />
								),
							}}
						/>
					);
				})}
			</Tab.Navigator>
		</NavigationContainer>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
	},
	btn: {
		width: 50,
		height: 50,
		borderWidth: 4,
		borderRadius: 25,
		backgroundColor: "transparent",
		justifyContent: "center",
		alignItems: "center",
	},
	text: {
		fontSize: 10,
		textAlign: "center",
		color: Colors.white,
		marginTop: 6,
	},
	circle: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.darkPurple,
		borderRadius: 25,
	},
});

export default App;
