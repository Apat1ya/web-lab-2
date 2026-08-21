INSERT INTO books (title, author, price, stock, description, image_url)
VALUES
    (
        'Harry Potter and the Philosopher''s Stone',
        'J. K. Rowling',
        300.00,
        12,
        'A fantasy novel about a young wizard.',
        'https://content1.rozetka.com.ua/goods/images/big/520901450.jpg'
    ),
    (
        'Moby-Dick',
        'Herman Melville',
        250.00,
        8,
        'A classic sea adventure novel.',
        'assets/moby-dick-cover.svg'
    ),
    (
        'The Little Prince',
        'Antoine de Saint-Exupery',
        200.00,
        15,
        'A poetic story for children and adults.',
        'https://bi.ua/uploaded-images/products/size_650/604993_1.jpg'
    ),
    (
        'Pusheen: A Cat''s Guide to Everything',
        'Claire Belton',
        280.00,
        9,
        'A funny illustrated book about Pusheen the cat.',
        'https://content2.rozetka.com.ua/goods/images/big/511797154.png'
    ),
    (
        'The Hobbit',
        'J. R. R. Tolkien',
        340.00,
        11,
        'A fantasy adventure about Bilbo Baggins.',
        'https://s9.vcdn.biz/static/f/11655463061/071bf3ab81c44da0b91377674e0c0a68.jpeg'
    ),
    (
        'Pride and Prejudice',
        'Jane Austen',
        230.00,
        7,
        'A classic novel about love and social expectations.',
        'assets/pride-and-prejudice-cover.svg'
    ),
    (
        'Dune',
        'Frank Herbert',
        420.00,
        6,
        'A science fiction novel set on the desert planet Arrakis.',
        'https://static.yakaboo.ua/media/cloudflare/product/webp/600x840/7/1/71oo1e-xpul._sl1500_.jpg'
    ),
    (
        'The Catcher in the Rye',
        'J. D. Salinger',
        260.00,
        10,
        'A coming-of-age story narrated by Holden Caulfield.',
        'https://content.rozetka.com.ua/goods/images/big/336376750.jpg'
    )
ON CONFLICT (title, author) DO NOTHING;
