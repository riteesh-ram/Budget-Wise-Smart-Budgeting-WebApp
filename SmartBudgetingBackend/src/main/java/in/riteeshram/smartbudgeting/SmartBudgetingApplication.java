package in.riteeshram.smartbudgeting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class SmartBudgetingApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartBudgetingApplication.class, args);
	}

}
