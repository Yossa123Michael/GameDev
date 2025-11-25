import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import credits from '../data/credits';
import './CreditView.css';
const CreditView = () => {
    return (_jsxs("div", { className: "credit-root", children: [_jsx("h1", { className: "credit-title", children: "Credit" }), _jsx("div", { className: "credits-scroll", children: credits.map((category) => {
                    const isTwo = category.layout === 'two-column';
                    if (isTwo) {
                        // Tetap 2 kolom: kiri (label, right), tengah kosong, kanan (name, left)
                        return (_jsxs("section", { className: "credit-category two", children: [_jsx("h2", { className: "category-title", children: category.title }), category.subtitle && _jsx("div", { className: "category-subtitle", children: category.subtitle }), _jsx("div", { className: "rows", children: category.items.map((it, idx) => (_jsxs("div", { className: "row-3col", title: `${it.label ?? ''}${it.label ? ' — ' : ''}${it.name}${it.subtitle ? ' — ' + it.subtitle : ''}`, children: [_jsx("div", { className: "col-left", children: it.label ? (it.url ? (_jsx("a", { className: "credit-link ellipsis", href: it.url, target: "_blank", rel: "noopener noreferrer", children: it.label })) : (_jsx("span", { className: "plain-text ellipsis", children: it.label }))) : null }), _jsx("div", { className: "col-mid" }), _jsxs("div", { className: "col-right", children: [it.url ? (_jsx("a", { className: "credit-link strong ellipsis", href: it.url, target: "_blank", rel: "noopener noreferrer", children: it.name })) : (_jsx("span", { className: "plain-text strong ellipsis", children: it.name })), it.subtitle && (_jsxs("span", { className: "item-subtitle-inline ellipsis", children: [" \u2014 ", it.subtitle] }))] })] }, idx))) })] }, category.title));
                    }
                    // SINGLE: 1 kolom saja, benar-benar di tengah. Tidak memakai grid/2 kolom.
                    return (_jsxs("section", { className: "credit-category single", children: [_jsx("h2", { className: "category-title", children: category.title }), category.subtitle && _jsx("div", { className: "category-subtitle", children: category.subtitle }), _jsx("ul", { className: "single-list", children: category.items.map((it, idx) => (_jsxs("li", { className: "single-item", title: `${it.label ?? ''}${it.label ? ' — ' : ''}${it.name}${it.subtitle ? ' — ' + it.subtitle : ''}`, children: [it.url ? (_jsx("a", { className: "credit-link strong ellipsis center-only", href: it.url, target: "_blank", rel: "noopener noreferrer", children: it.name })) : (_jsx("span", { className: "plain-text strong ellipsis center-only", children: it.name })), it.subtitle && (_jsxs("div", { className: "item-subtitle-center ellipsis", children: ["\u2014 ", it.subtitle] }))] }, idx))) })] }, category.title));
                }) })] }));
};
export default CreditView;
