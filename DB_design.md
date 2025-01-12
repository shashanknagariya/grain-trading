
# Database Design

## Tables

### 1. `grains`
| Column         | Type     | Constraints         |
|----------------|----------|---------------------|
| `id`           | INTEGER  | PRIMARY KEY         |
| `name`         | TEXT     | UNIQUE, NOT NULL    |
| `bag_weight`   | INTEGER  | NOT NULL            |

### 2. `purchases`
| Column         | Type     | Constraints         |
|----------------|----------|---------------------|
| `id`           | INTEGER  | PRIMARY KEY         |
| `grain_id`     | INTEGER  | FOREIGN KEY (`grains.id`) |
| `quantity`     | REAL     | NOT NULL            |
| `price`        | REAL     | NOT NULL            |
| `supplier`     | TEXT     | NOT NULL            |
| `payment_status` | TEXT   | DEFAULT 'Pending'   |
| `created_at`   | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 3. `inventory`
| Column         | Type     | Constraints         |
|----------------|----------|---------------------|
| `id`           | INTEGER  | PRIMARY KEY         |
| `grain_id`     | INTEGER  | FOREIGN KEY (`grains.id`) |
| `warehouse`    | TEXT     | NOT NULL            |
| `quantity`     | REAL     | DEFAULT 0           |

### 4. `sales`
| Column         | Type     | Constraints         |
|----------------|----------|---------------------|
| `id`           | INTEGER  | PRIMARY KEY         |
| `grain_id`     | INTEGER  | FOREIGN KEY (`grains.id`) |
| `quantity`     | REAL     | NOT NULL            |
| `price`        | REAL     | NOT NULL            |
| `buyer`        | TEXT     | NOT NULL            |
| `broker_commission` | REAL | NOT NULL           |
| `created_at`   | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 5. `users`
| Column         | Type     | Constraints         |
|----------------|----------|---------------------|
| `id`           | INTEGER  | PRIMARY KEY         |
| `name`         | TEXT     | NOT NULL            |
| `role`         | TEXT     | NOT NULL            |
| `email`        | TEXT     | UNIQUE, NOT NULL    |
| `password`     | TEXT     | NOT NULL            |

