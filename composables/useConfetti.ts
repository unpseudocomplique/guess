import confetti from "canvas-confetti";

export const useConfetti = () => {
    const triggerSideCannons = () => {
        const end = Date.now() + 3 * 1000; // 3 seconds
        const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

        // Frame function to trigger confetti cannons
        function frame() {
            if (Date.now() > end) return;

            // Left side confetti cannon
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                startVelocity: 60,
                origin: { x: 0, y: 0.5 },
                colors: colors,
            });

            // Right side confetti cannon
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                startVelocity: 60,
                origin: { x: 1, y: 0.5 },
                colors: colors,
            });

            requestAnimationFrame(frame); // Keep calling the frame function
        }

        frame();
    };

    return { triggerSideCannons };
}
