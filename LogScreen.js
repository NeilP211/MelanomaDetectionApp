import { SafeAreaView, Text, ScrollView } from "react-native";
import { Logs } from "./HomeScreen";
import { useState, useEffect } from "react";

const LogScreen = () => {
	const [logs, setLogs] = useState(null);

	useEffect(() => {
		(async function () {
			setLogs(await Logs.get());
			const e = Logs.add.bind(Logs);
			Logs.add = async function () {
				await e(...arguments);
				console.log("refreshing trust");
				setLogs([]);
				setLogs(await Logs.get());
				console.log("updated !");
			};
		})();
	}, []);

	return (
		<SafeAreaView>
			<ScrollView style={{ paddingTop: 50 }}>
				{logs
					? logs.map((item, index) => (
							<Text
								style={{
									paddingTop: 20,
									textAlign: "center",
									fontSize: 20,
									fontWeight: "bold",
								}}
								key={index}
							>
								{item.date.toLocaleString("en-US")}
								{": "}
								{item.formattedPrediction}
							</Text>
					  ))
					: null}
			</ScrollView>
		</SafeAreaView>
	);
};

export default LogScreen;
