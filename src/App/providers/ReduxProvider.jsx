import { Provider } from "react-redux";
import store from "../store";

/**
 * Provider Redux pour l'application
 * Enveloppe l'application avec le store Redux
 */
const ReduxProvider = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
