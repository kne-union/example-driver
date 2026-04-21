import '@testing-library/jest-dom';

// Mock IntersectionObserver
class MockIntersectionObserver {
    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.elements = [];
    }

    observe(element) {
        this.elements.push(element);
    }

    unobserve(element) {
        this.elements = this.elements.filter(el => el !== element);
    }

    disconnect() {
        this.elements = [];
    }

    // Helper to simulate intersection changes in tests
    triggerIntersection(entry) {
        this.callback([entry]);
    }
}

window.IntersectionObserver = MockIntersectionObserver;
window.HTMLElement.prototype.getBoundingClientRect = function () {
    return {
        width: this.offsetWidth || 0,
        height: this.offsetHeight || 0,
        top: 0,
        left: 0,
        bottom: this.offsetHeight || 0,
        right: this.offsetWidth || 0,
    };
};
