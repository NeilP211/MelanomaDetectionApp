import {
	StyleSheet,
	View,
	TouchableOpacity,
	Text,
	Platform,
} from "react-native";
import * as tf from "@tensorflow/tfjs";
import { fetch } from "@tensorflow/tfjs-react-native";
import * as ImagePicker from "expo-image-picker";
import { Asset } from "expo-asset";
import * as jpeg from "jpeg-js";
import { useEffect, useState } from "react";
import Colors from "../Colors";
// require('fs').writeFileSync('./weights.js', 'module.exports = \'' + require('fs').readFileSync('./assets/weights.bin').toString('base64') + '\';');
// import Weight from "../weights";
import { io } from "@tensorflow/tfjs-core";
import AsyncStorage from "@react-native-async-storage/async-storage";

const b64ToAB = (function () {
	/** Polyfill https://github.com/MaxArt2501/base64-js */
	// base64 character set, plus padding character (=)
	var b64 = {
			A: 0,
			B: 1,
			C: 2,
			D: 3,
			E: 4,
			F: 5,
			G: 6,
			H: 7,
			I: 8,
			J: 9,
			K: 10,
			L: 11,
			M: 12,
			N: 13,
			O: 14,
			P: 15,
			Q: 16,
			R: 17,
			S: 18,
			T: 19,
			U: 20,
			V: 21,
			W: 22,
			X: 23,
			Y: 24,
			Z: 25,
			a: 26,
			b: 27,
			c: 28,
			d: 29,
			e: 30,
			f: 31,
			g: 32,
			h: 33,
			i: 34,
			j: 35,
			k: 36,
			l: 37,
			m: 38,
			n: 39,
			o: 40,
			p: 41,
			q: 42,
			r: 43,
			s: 44,
			t: 45,
			u: 46,
			v: 47,
			w: 48,
			x: 49,
			y: 50,
			z: 51,
			0: 52,
			1: 53,
			2: 54,
			3: 55,
			4: 56,
			5: 57,
			6: 58,
			7: 59,
			8: 60,
			9: 61,
			"+": 62,
			"/": 63,
			"=": 64,
		},
		// Regular expression to check formal correctness of base64 encoded strings
		b64re =
			/^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

	return function (string) {
		// atob can work with strings with whitespaces, even inside the encoded part,
		// but only \t, \n, \f, \r and ' ', which can be stripped.
		// string = String(string).replace(/[\t\n\f\r ]+/g, "");
		// if (!b64re.test(string))
		// 	throw new TypeError(
		// 		"Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded."
		// 	);

		// Adding the padding if missing, for semplicity
		var bitmap,
			result = new Uint8Array(3 * Math.ceil(string.length / 4)),
			ri = 0,
			r1,
			r2,
			i = 0;
		for (; i < string.length; ) {
			bitmap =
				(b64[string[i++]] << 18) |
				(b64[string[i++]] << 12) |
				((r1 = b64[string[i++]]) << 6) |
				(r2 = b64[string[i++]]);

			if (r1 === 64) result[ri++] = (bitmap >> 16) & 255;
			else if (r2 === 64) {
				result[ri++] = (bitmap >> 16) & 255;
				result[ri++] = (bitmap >> 8) & 255;
			} else {
				result[ri++] = (bitmap >> 16) & 255;
				result[ri++] = (bitmap >> 8) & 255;
				result[ri++] = bitmap & 255;
			}
		}

		return result.buffer;
	};
})();

class ignorethis {
	constructor(model, weights) {
		if (!Array.isArray(weights)) weights = [weights];
		this.model = model;
		this.weights = weights;
	}
	async load() {
		const weightsAssets = this.weights.map((id) => Asset.fromModule(id));
		const modelArtifacts = Object.assign({}, this.model);
		modelArtifacts.weightSpecs = this.model.weightsManifest[0].weights;
		//@ts-ignore
		delete modelArtifacts.weightManifest;

		// modelArtifacts.weightData = b64ToAB(Weight);
		const weightsDataArray = await Promise.all(
			weightsAssets.map(async (weightAsset) => {
				const url = weightAsset.uri;
				const requestInit = undefined;
				const response = await fetch(url, requestInit, {
					isBinary: true,
				});
				const weightData = await response.arrayBuffer();
				return weightData;
			})
		);

		modelArtifacts.weightData =
			io.concatenateArrayBuffers(weightsDataArray);

		return modelArtifacts;
	}
}

/**
 * @typedef {{ date: Date, prediction: number, formattedPrediction: string }} Log
 */
export const Logs = (function () {
	let store;
	return {
		/**
		 * @returns {Promise<Log[]>}
		 */
		async get() {
			if (store) return store;
			const eeeeaaaa = await AsyncStorage.getItem("logs");
			return (store =
				eeeeaaaa !== null
					? JSON.parse(eeeeaaaa, (k, v) =>
							k === "date" ? new Date(v) : v
					  )
					: []);
		},
		/**
		 * @param {Log[] | undefined} v
		 */
		async save(v) {
			if (!v) v = store;
			const jsonValue = JSON.stringify(v);
			await AsyncStorage.setItem("logs", jsonValue);
		},
		/**
		 * @param {number} prediction
		 */
		async add(prediction) {
			if (!store) await this.get();
			store.push({
				date: new Date(),
				prediction,
				formattedPrediction: Math.round(prediction * 100) + "%",
			});
			await this.save();
		},
	};
})();

const Output = ({ predictions }) => {
	let melanomaProb = "";
	if (predictions) {
		prob = predictions.dataSync()[0];
		melanomaProb = Math.round(prob * 100) + "%";
		Logs.add(prob);
	}
	return (
		<View style={styles.container}>
			<Text style={styles.txt}>
				Probability {"\n"}
				{melanomaProb}
			</Text>
		</View>
	);
};

const HomeScreen = () => {
	const [isTfReady, setTfReady] = useState(false); // gets and sets the Tensorflow.js module loading status
	const [model, setModel] = useState(null); // gets and sets the locally saved Tensorflow.js model
	const [image, setImage] = useState(null); // gets and sets the image selected from the user
	const [predictions, setPredictions] = useState(null); // gets and sets the predicted value from the model
	const [error, setError] = useState(false); // gets and sets any errors

	async function getPermissionAsync() {
		if (Platform.OS !== "web") {
			const libraryStatus =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (libraryStatus.status !== "granted") {
				alert(
					"Sorry, we need camera roll permissions to make this work!"
				);
			}
		}
	}

	useEffect(() => {
		(async () => {
			await tf.ready(); // wait for Tensorflow.js to get ready
			setTfReady(true); // set the state

			// bundle the model files and load the model:
			const model = require("../assets/model.json");
			const weights = require("../assets/weights.bin");
			try {
				console.log("loading model");
				// await new ignorethis(model, weights).load();
				const loadedModel = await tf.loadGraphModel(
					// bundleResourceIO(model, weights)
					new ignorethis(model, weights)
				);

				setModel(loadedModel); // load the model to the state
				console.log("loaded");
			} catch (e) {
				console.log("skill issues", e);
			}
			getPermissionAsync(); // get the permission for camera roll access for iOS users
		})();
	}, []);

	async function handlerSelectImage() {
		try {
			let response = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true, // on Android user can rotate and crop the selected image; iOS users can only crop
				quality: 1, // go for highest quality possible
				aspect: [1, 1], // maintain aspect ratio of the crop area on Android; on iOS crop area is always a square,
				base64: true,
			});

			if (!response.canceled) {
				const source = { data: response.assets[0].base64 };
				setImage(source);
				console.log("image set"); // put image path to the state
				const imageTensor = await imageToTensor(source); // prepare the image
				console.log("image processed");
				const predictions = await model.predict(imageTensor); // send the image to the model
				console.log("predictions made");
				console.log(predictions.dataSync());
				setPredictions(predictions); // put model prediction to the state
			}
		} catch (error) {
			console.log("skill issues", error);
			setError(error);
		}
	}

	async function imageToTensor(source) {
		// load the raw data of the selected image into an array
		const rawImageData = b64ToAB(source.data);
		const { width, height, data } = jpeg.decode(rawImageData, {
			useTArray: true, // Uint8Array = true
		});

		// remove the alpha channel:
		const buffer = new Uint8Array(width * height * 3);
		let offset = 0;
		for (let i = 0; i < buffer.length; i += 3) {
			buffer[i] = data[offset];
			buffer[i + 1] = data[offset + 1];
			buffer[i + 2] = data[offset + 2];
			offset += 4;
		}

		// transform image data into a tensor
		const img = tf.tensor3d(buffer, [width, height, 3]);

		// // calculate square center crop area
		// const shorterSide = Math.min(width, height);
		// const startingHeight = (height - shorterSide) / 2;
		// const startingWidth = (width - shorterSide) / 2;
		// const endingHeight = startingHeight + shorterSide;
		// const endingWidth = startingWidth + shorterSide;

		// // slice and resize the image
		// const sliced_img = img.slice(
		// 	[startingWidth, startingHeight, 0],
		// 	[endingWidth, endingHeight, 3]
		// );
		// const resized_img = tf.image.resizeBilinear(sliced_img, [180, 180]);
		const resized_img = tf.image.resizeBilinear(img, [224, 224]);

		// add a fourth batch dimension to the tensor
		const expanded_img = resized_img.expandDims(0);

		// normalise the rgb values to -1-+1
		return expanded_img.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
	}

	return (
		<View style={styles.container}>
			<Text style={styles.txt}>MELANOMA DETECTION</Text>
			<View style={styles.container}>
				<TouchableOpacity
					style={styles.btn}
					onPress={
						model && !predictions // Activates handler only if the model has been loaded and there are no predictions done yet
							? handlerSelectImage
							: () => {
									setPredictions(null);
									handlerSelectImage();
							  }
					}
				>
					<Text style={{ color: Colors.white }}>PICK IMAGE</Text>
				</TouchableOpacity>
				<Output predictions={predictions || null} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
	},
	btn: {
		padding: 40,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "green",
		backgroundColor: Colors.darkPurple,
		top: 100,
		position: "absolute",
	},
	txt: {
		textAlign: "center",
		fontWeight: "bold",
		fontSize: 18,
		marginTop: 150,
		width: 200,
	},
});

export default HomeScreen;
