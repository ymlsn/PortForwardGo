SET
  SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

SET
  AUTOCOMMIT = 0;

START TRANSACTION;

SET
  time_zone = "+08:00";

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `status` enum('Unpaid','Paid') NOT NULL DEFAULT 'Unpaid',
  `expired` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `type` text NOT NULL,
  `name` text NOT NULL,
  `value` text NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

ALTER TABLE
  `invoices`
ADD
  PRIMARY KEY (`id`);

ALTER TABLE
  `payments`
ADD
  PRIMARY KEY (`id`);

ALTER TABLE
  `invoices`
MODIFY
  `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE
  `payments`
MODIFY
  `id` int(11) NOT NULL AUTO_INCREMENT;

INSERT INTO
  `settings` (`id`, `name`, `value`)
VALUES
  (NULL, 'system_url', ''),
  (NULL, 'register', 'false'),
  (NULL, 'register_recaptcha', 'false'),
  (NULL, 'recaptcha_public', ''),
  (NULL, 'recaptcha_private', '');

INSERT INTO
  `payments` (`id`, `type`, `name`, `value`)
VALUES
  (NULL, 'whmcs', 'enable', 'false'),
  (NULL, 'whmcs', 'display', 'WHMCS'),
  (NULL, 'whmcs', 'fee', ''),
  (NULL, 'whmcs', 'api', ''),
  (NULL, 'whmcs', 'secret', ''),
  (NULL, 'alipay_qr', 'enable', 'false'),
  (NULL, 'alipay_qr', 'display', '支付宝'),
  (NULL, 'alipay_qr', 'fee', ''),
  (NULL, 'alipay_qr', 'appid', ''),
  (NULL, 'alipay_qr', 'public_key', ''),
  (NULL, 'alipay_qr', 'private_key', ''),
  (NULL, 'epay', 'enable', 'false'),
  (NULL, 'epay', 'display', '易支付'),
  (NULL, 'epay', 'fee', ''),
  (NULL, 'epay', 'api', ''),
  (NULL, 'epay', 'id', ''),
  (NULL, 'epay', 'key', ''),
  (NULL, 'epay', 'methods', ''),
  (NULL, 'usdt_trc20', 'enable', 'false'),
  (NULL, 'usdt_trc20', 'display', 'USDT TRC20'),
  (NULL, 'usdt_trc20', 'fee', ''),
  (NULL, 'usdt_trc20', 'api', ''),
  (NULL, 'usdt_trc20', 'token', '');

TRUNCATE TABLE `traffic_statistics`;

COMMIT;