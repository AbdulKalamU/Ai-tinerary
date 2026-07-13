#!/bin/bash

echo "🚀 AI-Tinerary Local Verification"
echo "=================================="
echo ""

# Check MySQL
echo "🗄️  Step 1: Checking MySQL..."
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL not installed"
    echo ""
    echo "Install with:"
    echo "  brew install mysql@8.0"
    echo "  brew services start mysql@8.0"
    echo ""
    exit 1
fi
echo "✅ MySQL installed"

# Check if MySQL is running
if ! mysqladmin ping -h localhost -u root --password='' 2>/dev/null && ! mysqladmin ping -h localhost -u root 2>/dev/null; then
    echo "⚠️  MySQL might not be running"
    echo "Start with: brew services start mysql@8.0"
fi
echo ""

# Check environment file
echo "⚙️  Step 2: Checking environment configuration..."
if [ -f .env.local ]; then
    source .env.local
    echo "✅ Environment variables loaded from .env.local"
else
    echo "❌ .env.local not found"
    echo ""
    echo "Create .env.local with:"
    echo "  export DB_HOST=localhost"
    echo "  export DB_USERNAME=aitinerary_user"
    echo "  export DB_PASSWORD=aitinerary_pass"
    echo "  export JWT_SECRET=your_jwt_secret"
    echo "  export GEMINI_API_KEY=your_api_key"
    echo ""
    exit 1
fi
echo ""

# Build application
echo "🔨 Step 3: Building application..."
./mvnw clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Check if database exists
echo "🗄️  Step 4: Checking database..."
DB_EXISTS=$(mysql -u $DB_USERNAME -p$DB_PASSWORD -e "SHOW DATABASES LIKE 'aitinerary';" 2>/dev/null | grep aitinerary)
if [ -z "$DB_EXISTS" ]; then
    echo "❌ Database 'aitinerary' not found"
    echo ""
    echo "Create database with:"
    echo "  mysql -u root -p"
    echo "  CREATE DATABASE aitinerary;"
    echo "  CREATE USER 'aitinerary_user'@'localhost' IDENTIFIED BY 'aitinerary_pass';"
    echo "  GRANT ALL PRIVILEGES ON aitinerary.* TO 'aitinerary_user'@'localhost';"
    echo "  FLUSH PRIVILEGES;"
    echo ""
    exit 1
fi
echo "✅ Database 'aitinerary' exists"
echo ""

echo "=================================="
echo "✅ Pre-flight checks complete!"
echo "=================================="
echo ""
echo "🎯 Ready for manual testing"
echo ""
echo "Next steps:"
echo ""
echo "1. In THIS terminal, start the application:"
echo "   source .env.local"
echo "   ./mvnw spring-boot:run"
echo ""
echo "2. Open a NEW terminal and run verification tests:"
echo "   See LOCAL_VERIFICATION.md Step 5 for test commands"
echo ""
echo "3. Or run quick smoke test:"
echo "   ./smoke-test.sh"
echo ""
