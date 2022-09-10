// eslint-disable-next-line import/no-mutable-exports
export let width = window.innerWidth;
// eslint-disable-next-line import/no-mutable-exports
export let height = window.innerHeight;
window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
});
