const Test = () => {

	const obj = {
		test: '1',
		test2: '21',
		test3: '13',
		test4: '4',
		test5: '5',
	};
	const obj2 = {
		test45: '1',
		test23: '21',
		test43: '13',
		test455: '4',
		test523: '5',
	};

	console.log({...obj, ...obj2});
};

export default Test;