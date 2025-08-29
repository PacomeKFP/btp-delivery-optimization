weights = [0.18, 0.26, 0.10, 0.13, 0.16, 0.13, 0.04]
scores = [75, 70, 60, 75, 65, 85, 65]
products = [w * s for w, s in zip(weights, scores)]
total = sum(products)
print('Products:', products)
print('Total sum:', total)
