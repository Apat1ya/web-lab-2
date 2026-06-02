INSERT INTO books (title, author, price, stock, description, image_url)
VALUES
    (
        'Harry Potter and the Philosopher''s Stone',
        'J. K. Rowling',
        300.00,
        12,
        'A fantasy novel about a young wizard.',
        'assets/covers/harry-potter.webp'
    ),
    (
        'Moby-Dick',
        'Herman Melville',
        250.00,
        8,
        'A classic sea adventure novel.',
        'assets/covers/moby-dick.png'
    ),
    (
        'The Little Prince',
        'Antoine de Saint-Exupery',
        200.00,
        15,
        'A poetic story for children and adults.',
        'assets/covers/little-prince.jpg'
    ),
    (
        'Pusheen: A Cat''s Guide to Everything',
        'Claire Belton',
        280.00,
        9,
        'A funny illustrated book about Pusheen the cat.',
        'assets/covers/pusheen.webp'
    ),
    (
        'The Hobbit',
        'J. R. R. Tolkien',
        340.00,
        11,
        'A fantasy adventure about Bilbo Baggins.',
        'assets/covers/hobbit.jpeg'
    ),
    (
        'Pride and Prejudice',
        'Jane Austen',
        230.00,
        7,
        'A classic novel about love and social expectations.',
        'assets/covers/pride-and-prejudice.jpg'
    ),
    (
        'Dune',
        'Frank Herbert',
        420.00,
        6,
        'A science fiction novel set on the desert planet Arrakis.',
        'assets/covers/dune.jpg'
    ),
    (
        'The Catcher in the Rye',
        'J. D. Salinger',
        260.00,
        10,
        'A coming-of-age story narrated by Holden Caulfield.',
        'assets/covers/catcher-in-the-rye.webp'
    )
ON CONFLICT (title, author) DO UPDATE
SET image_url = EXCLUDED.image_url,
    updated_at = NOW();
