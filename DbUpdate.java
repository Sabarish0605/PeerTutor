import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class DbUpdate {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/peertutor?useSSL=false&serverTimezone=UTC", "root", "Sabarish@2006");
            // The BCrypt hash for "password123"
            String newHash = "$2a$10$pwCh0a414pdrR3il3d6bjuAfwDSUfvDRHn4gXFp4LTxzlkDXZ98OS";
            PreparedStatement pstmt = conn.prepareStatement("UPDATE users SET password = ? WHERE email IN ('sabarish0605@gmail.com', 'srihari@gmail.com')");
            pstmt.setString(1, newHash);
            int updated = pstmt.executeUpdate();
            System.out.println("Updated " + updated + " users' passwords to 'password123'");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
