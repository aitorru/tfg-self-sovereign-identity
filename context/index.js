import React, { useContext, createContext } from 'react';

//Context
export const AppContext = createContext(null);

//Provider
export const AppContextProvider = ({ children }) => {
	const [DID, setDID] = React.useState(false);
	const ipfs = React.useRef(false);
	const [DB, setDB] = React.useState(false);
	const OrbitDBidentity = React.useRef(false);
	const contract = React.useRef(false);

	//ComponentDidMouunt
	React.useEffect(() => {

	}, []);

	//
	const values = React.useMemo(() => (
		{
			DID,
			setDID,
			ipfs,
			DB,
			setDB,
			OrbitDBidentity,
			contract,
		}),
	[
		DID, ipfs, DB, OrbitDBidentity, contract]);   // States que serán visibles en el contexto.

	// Interface donde será expuesto como proveedor y envolverá la App.
	return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};

//
export function useAppContext() {
	const context = useContext(AppContext);

	if (!context) {
		console.error('Error deploying App Context!!!');
	}

	return context;
}

export default useAppContext;