import { SafeAreaView, ScrollView, Text, StyleSheet, View } from "react-native";

const info = [
	{
		question: "What is the purpose of this app?",
		answer: "This app aims to facilitate preliminary checks of potential skin melanomas to determine if a blemish on the skin is enough of a concern to get screened by a professional. This app aims to be an additional screening between scheduled doctor visits but is not intended to serve in place of professionals.",
	},
	{
		question: "How do I use this app?",
		answer: "To use this app, click the camera icon below to open your phone's photo library and upload a picture of possible melanomas. For best results, ensure that the picture is not in a low-light area, and is approximately centered on the spot you want to test. Results will also vary based on camera quality. After you take the picture, the app will tell you if the mole/blemish could be a melanoma concern or not.",
	},
	{
		question: "What does it mean if my mole/blemish is a “concern”?",
		answer: "If the app marks your picture as a “concern”, this means that there’s a strong likelihood that your mole/blemish warrants a doctor’s visit and could be the cause of potential melanoma in the future. In the case of this happening, you should find your nearest dermatologist and talk to them about it.",
	},
];

const Part = ({ item }) => {
	return (
		<View>
			<Text style={styles.question}>{item.question}</Text>
			<Text style={styles.answer}>{item.answer}</Text>
			<Text>{"\n"}</Text>
		</View>
	);
};

const InfoScreen = () => {
	return (
		<SafeAreaView style={{ marginBottom: 140 }}>
			<ScrollView style={{ paddingTop: 40, paddingHorizontal: 20 }}>
				{info.map((item, index) => (
					<Part key={index} item={item} />
				))}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	question: {
		fontSize: 25,
		fontWeight: "bold",
	},
	answer: {
		fontSize: 15,
	},
});

export default InfoScreen;
