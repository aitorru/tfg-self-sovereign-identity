import React, { useContext, createContext } from 'react';

//Context
export const AppContext = createContext(null);

//Provider
export const AppContextProvider = ({ children }) => {
	const [DID, setDID] = React.useState(false);
	const [ipfs, setIpfs] = React.useState(false);
	const [DB, setDB] = React.useState(false);

	//ComponentDidMouunt
	React.useEffect(() => {

	}, []);

	//
	const values = React.useMemo(() => (
		{
			DID,
			setDID,
			ipfs,
			setIpfs,
			DB,
			setDB
		}),
	[
		DID, ipfs, DB]);   // States que serán visibles en el contexto.

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