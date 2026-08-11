import { describe, it, expect } from 'vitest';
import BuilderState from '../../src/js/models/BuilderState.js';

describe('BuilderState Model Unit Tests', () => {

    it('should initialize with empty cards array', () => {
        const state = new BuilderState();
        expect(state.cards).toHaveLength(0);
    });

    it('should add cards to state correctly', () => {
        const state = new BuilderState();
        const mockCard = { id: 1, node: {}, collapse: () => {}, destroy: () => {}, validate: () => true, getCardData: () => ({ question: "Q1" }) };
        
        state.addCard(mockCard);
        expect(state.cards).toHaveLength(1);
    });

    it('should remove cards from state correctly', () => {
        const state = new BuilderState();
        const mockCard1 = { id: 1, node: { remove: () => {} }, destroy: () => {} };
        const mockCard2 = { id: 2, node: { remove: () => {} }, destroy: () => {} };
        
        state.addCard(mockCard1);
        state.addCard(mockCard2);
        expect(state.cards).toHaveLength(2);

        state.removeCard(mockCard1);
        expect(state.cards).toHaveLength(1);
        expect(state.cards[0].id).toBe(2);
    });

    it('should collapse all cards cleanly', () => {
        const state = new BuilderState();
        let card1Collapsed = false;
        let card2Collapsed = false;

        const card1 = { collapse: () => { card1Collapsed = true; } };
        const card2 = { collapse: () => { card2Collapsed = true; } };

        state.addCard(card1);
        state.addCard(card2);
        state.collapseAllCards();

        expect(card1Collapsed).toBe(true);
        expect(card2Collapsed).toBe(true);
    });

    it('should serialize payload correctly', () => {
        const state = new BuilderState();
        const card = { getCardData: () => ({ question: "Q1", answers: [] }) };
        state.addCard(card);

        const payload = state.getSerializedPayload();
        expect(payload).toHaveLength(1);
        expect(payload[0].question).toBe("Q1");
    });
});
