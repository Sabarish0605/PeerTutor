import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/peertutor?useSSL=false&serverTimezone=UTC", "root", "Sabarish@2006");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, email, password FROM users");
            while (rs.next()) {
                System.out.println("ID: " + rs.getInt("id") + ", Email: " + rs.getString("email") + ", Password: " + rs.getString("password"));
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
