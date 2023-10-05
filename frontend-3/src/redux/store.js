import { configureStore } from "@reduxjs/toolkit";
import confirmMolecules from './counter';

export default configureStore({
    reducer: {
        counter: confirmMolecules
    }
});