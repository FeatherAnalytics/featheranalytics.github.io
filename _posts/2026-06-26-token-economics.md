---
layout: post
title: AI Token Economics
subtitle: Four concepts from microeconomics, applied to LLM context windows
tags: [ai, economics]
author: David Hardage
published: false
---

The economics of AI tokens map surprisingly well onto classical microeconomic frameworks. As context windows grow from 8K to 1M+ tokens, the same forces that govern production, consumption, and resource depletion show up in how we use — and overuse — compute.

Here are four concepts, visualized with stylized curves.

![AI Token Economics — Four Concepts]({{ '/assets/img/token_econ_charts.png' | relative_url }}){: .mx-auto.d-block :}

## 1. Producer Tradeoff (PPF)

A Production Possibility Frontier applied to LLM inference. With a fixed compute budget, providers face a tradeoff: longer context windows cost per-token quality. Moving along the frontier means sacrificing one for the other. This is classical opportunity cost — the same curve you'd see in any intro econ textbook, but the axes are context length and output quality.

The shape matters. The frontier is concave (bowed outward), meaning the marginal cost of more context accelerates. The first 10K tokens of window are cheap. The last 100K are expensive.

## 2. Window–Quality Equilibrium

Output quality falls as the window grows, but total useful output (Window × Quality) stays roughly constant along a rectangular hyperbola. This is the same shape as an isoquant in production theory — substituting quantity for quality at a constant product.

The practical implication: a 1M-token window doesn't produce 10× the value of a 100K window. You get more breadth but less depth per token. The product holds.

## 3. Relaxed Budget Constraint

As windows get larger (or tokens get cheaper), the budget constraint shifts outward. The shadow price of a token falls toward zero. Users become less frugal — they stop optimizing prompts, stop trimming context, stop caring about token counts.

This is standard consumer theory. When the price of a good drops, you consume more of it. The budget line rotates outward, and the optimal consumption point moves along with it.

## 4. Jevons Paradox (Induced Demand)

The punchline. William Stanley Jevons observed in 1865 that improvements in coal efficiency didn't reduce coal consumption — they increased it. The same pattern appears with AI tokens: as windows grow and prices fall, total token consumption grows disproportionately.

Each equal jump in window size produces an ever-larger jump in tokens used. The gap between proportional use and actual use (the shaded region) keeps widening. Efficiency gains get eaten by induced demand.

This is why the AI compute bill keeps growing even as unit costs fall. Jevons was right about coal, highways, and now tokens.

---

## The Thread

These four concepts tell a progression:

1. **PPF** sets the constraint — you can't have everything
2. **Equilibrium** shows constant output despite the tradeoff
3. **Budget relaxation** removes the constraint
4. **Jevons** shows why removing constraints doesn't save resources

The underlying economics haven't changed since Adam Smith. The medium has.

---

*Charts generated with matplotlib. [View the source script](https://github.com/FeatherAnalytics/research/tree/main/tokenomics/scripts/generate_charts.py).*
